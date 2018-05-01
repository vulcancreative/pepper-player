import { assert } from './assert';
import { Hooker } from './hooker';
import { strings } from './strings';
import { mergeDicts, isInt } from './helpers';
import { kSegmentType } from './constants';

class Stream extends Hooker {
  constructor(config = {}) {
    super();

    const kDefaultConfig = {
      mediaSource:  null,
      mpd:  null,
      adp:  null,
      rep:  null,
      sources:  null,
    };

    this.config = mergeDicts(config, kDefaultConfig);

    this.mediaSource = this.config.mediaSource;

    this.adp = this.config.adp;
    this.rep = this.config.rep;
    this.sources = this.config.sources;
    assert(this.rep !== null && typeof this.rep !== 'undefined');

    console.log(this.rep);
  }

  setup() {
    return new Promise((resolve, reject) => {
      this.init_().then((cache) => {
        this.cache = cache;
        resolve();
      });
    });
  }

  init_(cache = []) {
    return new Promise((resolve, reject) => {
      this.codecs = `${this.rep.mimeType}; codecs="${this.rep.codecs}"`;

      this.buffer = this.mediaSource.addSourceBuffer(this.codecs);
      this.buffer.mode = 'sequence';

      for (let i = 0; i != this.sources.length; i++) {
        const source = this.sources[i];
        const initName = source.initialization;
        const baseURL = source.baseURL;
        const initURL = baseURL ? `${baseURL}${initName}` : initName;

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
        reject(
          `Failed to append ${segment.type} to buffer for ` +
          `rep "${rep.id}"`
        );
      }

      buffer.onupdateend = (() => resolve(buffer));
    });
  }

  fillBuffer(next) {
    return new Promise((resolve, reject) => {
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

    if (points.constructor === Array) {
      for (let i = 0; i != points.length; i++) {
        const point = points[i];
        if (binSearchCache(point) > 1) {
          // console.log(`point(${point}) found`);
          // console.log(this.cache);
          return true;
        }
      }
    } else if (isInt(points)) {
      if (binSearchCache(point) > 1) {
        // console.log(`point(${point}) found`);
        // console.log(this.cache);
        return true;
      }
    } else {
      throw(`Invalid argument value : "${points}"`);
    }

    return false;
  }

  makePoints(current, target) {
    const rep = this.rep;
    const delta = target - current;
    const steps = parseInt(
      Math.ceil(parseFloat(delta) / parseFloat(this.segmentLength()))
    );

    const last = parseInt(
      Math.ceil(parseFloat(current) / parseFloat(this.segmentLength()))
    );

    let index = 0;
    return (new Array(steps).fill(last).map((v, i) => v + (i + 1)));
  }

  segmentLength() {
    const rep = this.rep;

    if (rep !== null && typeof rep !== 'undefined') {
      const timescale = parseFloat(rep.timescale);
      const duration = parseFloat(rep.segmentDuration);
      const ticks = Math.floor(duration / timescale);
      const size = parseInt(ticks) * 1000;

      return size;
    } else {
      throw(`Unable to determine segment length of rep "${rep.id}"`);
    }
  }

  switchToRep(repID) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i != this.cache.length; i++) {
        const segment = this.cache[i];

        if (segment.point === 0 && segment.rep === repID) {
          this.appendBuffer(this.buffer, segment).then((buffer) => {
            this.buffer = buffer;
            
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
