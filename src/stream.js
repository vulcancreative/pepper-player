import { mergeDicts, isInt } from './helpers';
import { arrayBufferToBase64 } from './convert';
import { kStreamType, kSegmentType } from './constants';

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

      // resolve setup immediately for non-audio/video adaptations
      if (!MediaSource.isTypeSupported(this.codecs)) {
        resolve(cache);
        return;
      }

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
      const type = this.mpd.type;
      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        if (xhr.status >= 400) {
          if (type === 'dynamic') {
            console.log(
              "Playing bleeding edge in dynamic mode; " +
              "waiting for more viable segments"
            );

            resolve(null);
            return;
          } else {
            console.error(
              `Unable to fetch segment at "${url}" for rep "${id}"`
            );
          }
        }

        if (xhr.status >= 200 && xhr.status < 400) {
          const data = xhr.response;

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

  bufferedLength() {
    const cachedAmt = this.cache.length;

    if (cachedAmt < 2) { return 0; }
    return Math.round((cachedAmt - 1) * this.segmentLength());
  }

  fillBuffer(next) {
    return new Promise((resolve) => {
      const rep = this.rep;
      const mediaName = this.buildMediaName_(rep, next);

      const baseURL = this.rep.baseURL;
      const mediaURL = baseURL ? `${baseURL}${mediaName}` : mediaName;

      this.fetchSegment_(mediaURL).catch((err) => {
        if (this.mpd.type === 'dynamic') {
          console.log(
            "Playing bleeding edge in dynamic mode; " +
            "waiting for more viable segments"
          );
        } else {
          console.log(`Unable to fetch segment "${mediaURL}" : ${err}`);
        }
      }).then((data) => {
        if (data === null || typeof data === 'undefined') {
          resolve(null);
          return;
        }

        if (this.type === kStreamType.image) {
          this.cache.push({
            point: next,
            mime: this.rep.mimeType,
            data: arrayBufferToBase64(data),
            info: rep.tileInfo,
          });

          resolve(data.byteLength);
          return;
        }

        this.cache.push({
          type: kSegmentType.segment,
          point: next,
          data: data,
          size: data.byteLength,
        });

        const i = this.cache.length - 1;
        this.appendBuffer(this.buffer, this.cache[i]).then((buffer) => {
          this.buffer = buffer;
          resolve(data.byteLength);
        });
      });
    });
  }

  // checks if a point (or array of points) has been cached
  inCache(points = []) {
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
        if (binSearchCache(point) > -1) { duplicates.push(point); }
      }
    } else if (isInt(points)) {
      const point = points;
      if (binSearchCache(point) > -1) { duplicates.push(point); }
    } else {
      throw(`Invalid argument value : "${points}"`);
    }

    return duplicates;
  }

  makePoints(current, target, now, rep) {
    // handle timeline-based mechanism
    if (rep !== null && typeof rep !== 'undefined') {
      if (rep.timeline !== null && typeof rep.timeline !== 'undefined') {
        if (rep.timeline.length > 0) {
          let result = [];
          const init = rep.timeline[0];
          const t = parseInt(init.getAttribute('t'));
          const d = parseInt(init.getAttribute('d'));

          result = [this.lastPoint ? this.lastPoint + d : t];
          this.lastPoint = result[result.length - 1];

          return result;
        }
      }
    }

    // handle template-based mechanism
    if (this.mpd.type === 'static') {
      if (rep.type === kStreamType.image && rep.tileInfo !== null) {
        const count = Math.ceil(this.mpd.duration / rep.tileInfo.duration);
        return (new Array(count)).fill(0).map((s, i) => i + 1);
      }

      const delta = (target < current ? current+1000 : target)-current;
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

  popCache(amt = 1) {
    return new Promise((resolve, reject) => {
      let breakIndex = 0;

      if (this.cache.length < amt + 1) { resolve(); }
      for (let i = 1; i < this.cache.length; i++) {
        if (this.cache[i].type === kSegmentType.init) {
          continue;
        }

        if (
          this.cache[i - 1].type === kSegmentType.init &&
          this.cache[i].type === kSegmentType.segment
        ) {
          breakIndex = i;
          break;
        }
      }

      if (breakIndex === 0) { reject(); }
      if (breakIndex + 1 + amt > this.cache.length) { reject(); }

      this.cache.splice(breakIndex, amt);
      resolve();
    });
  }

  segmentLength() {
    const rep = this.rep;

    if (rep !== null && typeof rep !== 'undefined') {
      // average size if timeline-based
      if (rep.timeline && rep.timeline.length > 0) {
        const points = [];

        for (let i = 0; i < rep.timeline.length; i++) {
          const point = rep.timeline[i];
          const scale = rep.timescale;
          const d = parseInt(point.getAttribute('d'));
          
          points.push(d / scale);
        }

        if (points.length > 0) {
          const sum = points.reduce((a, c) => a + c);
          return sum / points.length * 1000;
        }
      }

      // direct size if template-based
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

  buildMediaName_(rep, next) {
    const

    //e.g "...$Time$.m4s"
    nVarT = /\$Time\$/g,

    //e.g "...$Number$.m4s"
    nVarN = /\$Number\$/g,

    //e.g "...$Number%05d$.m4s"
    nVarD = /(\$Number%(\d+)d\$)/g,

    //e.g "stream$RepresentationID$..."
    rVarN = /\$RepresentationID\$/g;

    /*
     * TODO: solidfy as trace-level debug text
    console.log(`Filling buffer for rep "${rep.id}"`);
    console.log(`Current : ${current}, target : ${target}, ` +
                `segment length : ${this.segmentLength()}, ` +
                `steps : ${steps}`);
    */

    const nStr = `${next}`;
    let mediaName = rep.mediaTemplate.replace(rVarN, `${rep.id}`);

    if (nVarT.test(mediaName) && rep.timeline.length > 0) {
      /*
      const part = rep.timeline[0];

      const t = parseInt(part.getAttribute('t'));
      const r = parseInt(part.getAttribute('r'));
      const d = parseInt(part.getAttribute('d'));
      */

      mediaName = mediaName.replace(nVarT, nStr);
    } else if (nVarD.test(mediaName)) {
      const nVarDC = /(\$Number%(\d+)d\$)/g;

      const matches = nVarDC.exec(mediaName);
      const amount = parseInt(matches[matches.length - 1]) + 1;
      const segmentNumberExt = nStr.padStart(amount - 1, '0');

      mediaName = mediaName.replace(matches[0], segmentNumberExt);
      mediaName = mediaName.replace(nVarN, nStr);
    } else {
      mediaName = mediaName.replace(nVarN, nStr);
    }

    return mediaName;
  }
}

export { Stream };
