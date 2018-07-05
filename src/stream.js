import jr from './jr';
import { isInt, mergeDicts } from './helpers';
import { arrayBufferToBase64 } from './convert';
import { kMPDType, kStreamType, kSegmentType } from './constants';

class Stream {
  constructor(config = {}) {
    const kDefaultConfig = {
      adp: null,
      id:  null,
      mediaSource:  null,
      mpd:  null,
      sources:  null,
    };

    this.config = mergeDicts(config, kDefaultConfig);

    this.mediaSource = this.config.mediaSource;

    this.adp = this.config.adp;
    this.id = this.config.id;
    this.mpd = this.config.mpd;
    this.sources = this.config.sources;
    this.mpdWasUpdated = false;
  }

  setup() {
    return new Promise(async resolve => {
      this.cache = await this.init_();
      resolve();
    });
  }

  init_(cache = []) {
    return new Promise(async resolve => {
      const rep = this.rep();

      this.type = rep.type;
      this.codecs = `${rep.mimeType}; codecs="${rep.codecs}"`;

      // resolve setup immediately for non-audio/video adaptations
      if (!MediaSource.isTypeSupported(this.codecs)) {
        resolve(cache);
        return;
      }

      this.buffer = this.mediaSource.addSourceBuffer(this.codecs);
      this.buffer.mode = 'sequence';

      if (this.mpd.type === kMPDType.dynamic) {
        this.buffer.timestampOffset = 0.1;
      }

      /*
      for (let i = 0; i != this.sources.length; i++) {
        const source = this.sources[i];
        const initURL = source.initURL();

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
              if (segment.point === 0 && segment.rep === rep.id) {
                this.appendBuffer(this.buffer, segment).then((buffer) => {
                this.buffer = buffer;
                  resolve(cache);
                });
              }
            }
          }
        });
      }
      */

      const initSegments = await Promise.all(this.sources.map(source => {
        return new Promise(resolve => {
        const initURL = source.initURL();

          this.fetchSegment_(initURL).then((data) => {
            const segment = {
              type: kSegmentType.init,
              rep: source.id,
              point: 0,
              data: data,
              size: data.byteLength,
            };

            cache.push(segment);
            resolve(segment);
          });
        });
      }));

      // TODO: fix buffer append overlap
      for (let i = 0; i != initSegments.length; i++) {
        const segment = initSegments[i];
        if (segment.point === 0 && segment.rep === rep.id) {
          this.appendBuffer(this.buffer, segment).then((buffer) => {
            this.buffer = buffer;
            resolve();
          });
        }
      }

      resolve(cache);
    });
  }

  fetchSegment_(url = "") {
    return new Promise((resolve, reject) => {
      const rep = this.rep();

      const id = rep.id;
      const type = this.mpd.type;
      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        if (xhr.status >= 400) {
          if (type === kMPDType.dynamic) {
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

          // console.log(`Fetched segment at "${url}" for rep "${id}"`);
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
      const rep = this.rep();

      if (jr.ndef(buffer)) { reject("Buffer invalid!") }
      if (jr.ndef(segment)) { reject("Segment invalid!") }

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
    // if (jr.ndef(next)) { return Promise.resolve(0); }

    return new Promise(async resolve => {
      const rep = this.rep();

      const mediaURL = rep.mediaURL(next);

      let data;

      try {
        data = await this.fetchSegment_(mediaURL);
      } catch(err) {
        if (this.mpd.type === kMPDType.dynamic) {
          console.log(
            "Playing bleeding edge in dynamic mode; " +
            "waiting for more viable segments"
          );
        } else {
          console.log(`Unable to fetch segment "${mediaURL}" : ${err}`);
        }
      }

      if (jr.ndef(data)) { resolve(null); return }

      if (this.type === kStreamType.image) {
        this.cache.push({
          point: next,
          mime: rep.mimeType,
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
      this.buffer = await this.appendBuffer(this.buffer, this.cache[i]);
      resolve(data.byteLength);
    });
  }

  // checks if a point (or array of points) has been cached
  inCache(points = []) {
    let duplicates = [];

    let binSearchCache = (point) => {
      let min = 0;
      let max = this.cache.length - 1;
      let current, index = this.cache.length - 1;

      if (this.cache.length > 0 && this.cache[index].point === point) {
        return index;
      }

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

    for (let i = 0; i != points.length; i++) {
      const point = points[i];
      if (binSearchCache(point) > -1) { duplicates.push(point); }
    }

    // assumes potential for both Array and int input; weak, so pulled
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

    /*
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      for (let j = 0; j < this.cache.length; j++) {
        const c = this.cache[i];
        if (c && c.point === point) { duplicates.push(point) }
      }
    }
    */

    return duplicates;
  }

  makePoints(current, target, now) {
    const rep = this.rep();

    let result;
    let last = this.lastPoint || 0;

    [result, last] = rep.makePoints(this.mpd, current, target, now, last);

    this.lastPoint = last;
    return result;
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

  rep() {
    return this.mpd.repByID(this.id);
  }

  segmentLength() {
    const rep = this.rep();

    if (jr.ndef(rep)) {
      throw(`Unable to determine segment length of rep "${rep.id}"`);
    }

    return rep.segmentLength();
  }

  switchToRep(repID) {
    return new Promise(resolve => {
      for (let i = 0; i != this.cache.length; i++) {
        const segment = this.cache[i];

        if (segment.point === 0 && segment.rep === repID) {
          this.appendBuffer(this.buffer, segment).then((buffer) => {
            this.buffer = buffer;
            
            for (let j = 0; j != this.sources.length; j++) {
              const source = this.sources[j];
              if (source.id === repID) { this.id = source.id; break; }
            }

            resolve();
          });
        }
      }
    });
  }

  updateMPD() {
    this.mpdWasUpdated = true;
  }
}

export { Stream };
