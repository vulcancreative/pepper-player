import { assert } from './assert';
import { strings } from './strings';
import { mergeDicts, isInt } from './helpers';
import { kSegmentType } from './constants';

class Stream {
  constructor(config = {}) {
    const kDefaultConfig = {
      mediaSource:  null,
      mpd:  null,
      adp:  null,
      rep:  null,
      sources:  null,
    };

    this.config = mergeDicts(config, kDefaultConfig);

    this.mediaSource = this.config.mediaSource;

    this.mpd = this.config.mpd;
    this.adp = this.config.adp;
    this.rep = this.config.rep;
    this.sources = this.config.sources;
    assert(this.rep !== null && typeof this.rep !== 'undefined');

    console.log(this.rep);
  }

  setup() {
    return new Promise((resolve) => {
      this.init_().then((cache) => {
        this.cache = cache;
        resolve();
      });
    });
  }

  init_(cache = []) {
    return new Promise((resolve) => {
      this.type = this.rep.type;
      this.codecs = `${this.rep.mimeType}; codecs="${this.rep.codecs}"`;

      this.buffer = this.mediaSource.addSourceBuffer(this.codecs);
      this.buffer.mode = 'sequence';

      if (this.mpd.type === 'dynamic') {
        this.buffer.timestampOffset = 0.1;
      }

      for (let i = 0; i != this.sources.length; i++) {
        const source = this.sources[i];

        const id = source.id;
        const initName = source.initialization;
        const baseURL = source.baseURL;

        let initURL = baseURL ? `${baseURL}${initName}` : initName;
        initURL = initURL.replace(/\$RepresentationID\$/g, `${id}`);

        this.fetchSegment_(initURL).then((data) => {
          cache.push({
            type: kSegmentType.init,
            rep: source.id,
            point: 0,
            data: data,
            size: data.byteLength,
          });

          if (i === this.sources.length - 1) {
            for (let j = 0; j != cache.length; j++) {
              const segment = cache[j];
              if (segment.point === 0 && segment.rep === this.rep.id) {
                this.appendBuffer(this.buffer, segment).then((buffer) => {
                this.buffer = buffer;
                  resolve(cache);
                });
              }
            }
          }
        });
      }
    });
  }

  fetchSegment_(url = "") {
    return new Promise((resolve, reject) => {
      const id = this.rep.id;
      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          const data = xhr.response;

          assert(data !== null && typeof data !== 'undefined');
          assert(data.byteLength && data.byteLength > 0);

          console.log(`Fetched segment at "${url}" for rep "${id}"`);
          resolve(data);
        } else {
          reject(`Unable to fetch segment at "${url}" for rep "${id}"`);
        }
      }

      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';
      xhr.send();
    });
  }

  appendBuffer(buffer, segment) {
    return new Promise((resolve, reject) => {
      const rep = this.rep;

      if (buffer === null || typeof buffer === 'undefined') {
        reject("Buffer invalid!");
      }

      if (segment === null || typeof segment === 'undefined') {
        reject("Segment invalid!");
      }

      try {
        buffer.appendBuffer(new Uint8Array(segment.data));
        /*
         * TODO: solidfy as trace-level debug text
        console.log(
          `Successfully appended ${segment.type} to ` +
          `buffer for rep "${rep.id}"`
        );
        */
      } catch(err) {
        console.log(err);
        console.log(
          `Failed to append ${segment.type} to buffer for ` +
          `rep "${rep.id}"`
        );
      }

      buffer.onupdateend = (() => resolve(buffer));
    });
  }

  fillBuffer(next) {
    return new Promise((resolve) => {
      const rep = this.rep;

      const nVarN = /\$Number\$/g,      //e.g "...$Number$.m4s"
      nVarD = /(\$Number%(\d+)d\$)/g,   //e.g "...$Number%05d$.m4s"
      rVarN = /\$RepresentationID\$/g;  //e.g "stream$RepresentationID$..."

      /*
       * TODO: solidfy as trace-level debug text
      console.log(`Filling buffer for rep "${rep.id}"`);
      console.log(`Current : ${current}, target : ${target}, ` +
                  `segment length : ${this.segmentLength()}, ` +
                  `steps : ${steps}`);
      */

      let mediaName = rep.mediaTemplate.replace(rVarN, `${rep.id}`);

      if (nVarD.test(mediaName)) {
        const nVarDC = /(\$Number%(\d+)d\$)/g;

        const matches = nVarDC.exec(mediaName);
        const amount = parseInt(matches[matches.length - 1]) + 1;
        const segmentNumberExt = strings.pad(next, amount);

        mediaName = mediaName.replace(matches[0], segmentNumberExt);
        mediaName = mediaName.replace(nVarN, `${next}`);
      } else {
        mediaName = mediaName.replace(nVarN, `${next}`);
      }

      const baseURL = this.rep.baseURL;
      const mediaURL = baseURL ? `${baseURL}${mediaName}` : mediaName;

      this.fetchSegment_(mediaURL).then((data) => {
        this.cache.push({
          type: kSegmentType.segment,
          point: next,
          data: data,
          size: data.byteLength,
        });

        const i = this.cache.length - 1;
        this.appendBuffer(this.buffer, this.cache[i]).then((buffer) => {
          this.buffer = buffer;

          // const newTime = parseInt(current + this.segmentLength());
          resolve(data.byteLength);
        });
      });
    });
  }

  // checks if a point (or array of points) has been cached
  inCache(points = []) {
    assert(points !== null && typeof points !== 'undefined');

    let binSearchCache = (point) => {
      let min = 0;
      let max = this.cache.length - 1;
      let index, current;

      while (min <= max) {
        index = (min + max) / 2 | 0;
        current = this.cache[index];

        if (current.point < point) {
          min = index + 1;
        } else if (current.point > point) {
          max = index - 1;
        } else {
          return index;
        }
      }

      return -1;
    };

    let duplicates = [];
    if (points.constructor === Array) {
      for (let i = 0; i != points.length; i++) {
        const point = points[i];
        if (binSearchCache(point) > 1) { duplicates.push(point); }
      }
    } else if (isInt(points)) {
      const point = points;
      if (binSearchCache(point) > 1) { duplicates.push(point); }
    } else {
      throw(`Invalid argument value : "${points}"`);
    }

    return duplicates;
  }

  makePoints(current, target, now) {
    if (this.mpd.type === 'static') {
      const delta = (target < current ? current+1000 : target) - current;
      const steps = parseInt(
        Math.ceil(parseFloat(delta) / parseFloat(this.segmentLength()))
      );

      const last = parseInt(
        Math.ceil(parseFloat(current) / parseFloat(this.segmentLength()))
      );

      return (new Array(steps).fill(last).map((v, i) => v + (i + 1)));
    } else if (this.mpd.type === 'dynamic') {
      const delta = Math.abs(now - this.mpd.startTime);
      return [Math.ceil(delta / this.segmentLength() - 10)];
    } else {
      throw(`Unable to decipher source type ("${this.mpd.type}")`);
    }
  }

  segmentLength() {
    const rep = this.rep;

    if (rep !== null && typeof rep !== 'undefined') {
      const timescale = parseFloat(rep.timescale);
      const duration = parseFloat(rep.segmentDuration);

      if ((timescale===null && typeof timescale==='undefined') ||
           isNaN(timescale)) { return duration * 1000; }

      const ticks = Math.floor(duration / timescale);
      const size = parseInt(ticks) * 1000;

      return size;
    } else {
      throw(`Unable to determine segment length of rep "${rep.id}"`);
    }
  }

  switchToRep(repID) {
    return new Promise((resolve) => {
      for (let i = 0; i != this.cache.length; i++) {
        const segment = this.cache[i];

        if (segment.point === 0 && segment.rep === repID) {
          this.appendBuffer(this.buffer, segment).then((buffer) => {
            this.buffer = buffer;
            this.id = repID;
            
            for (let j = 0; j != this.sources.length; j++) {
              const source = this.sources[j];
              if (source.id === repID) { this.rep = source; break; }
            }

            resolve();
          });
        }
      }
    });
  }
}

export { Stream };
