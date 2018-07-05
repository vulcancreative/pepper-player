import jr from './jr';
import clock from './clock';
import { MPD } from './mpd';
import { Stream } from './stream';
import { mergeDicts } from './helpers';
import { kMPDType, kStreamType } from './constants';
import { bps, kbps, speedFactor } from './measure';
import { mpdToM3U8, hlsPreferred, hlsMimeType } from './hls';

/*
// TODO: move within class structure
// merge passed config with default config; returning assembled config
function configure(config, kDefaultConfig) {
  mergedConfig = mergeDicts(config, kDefaultConfig);
  mergedConfig.playlist = validatePlaylist(mergedConfig.playlist);

  return mergedConfig;
}
*/

class State {
  constructor(config = {}) {
    const kDefaultConfig = {
      playlist: [],
      hooks:  {},
      base:   0,
      lead:   0,
      start:  0,
      timed:  0,
      track:  0,
      query:  "",
    };

    this.config = mergeDicts(config, kDefaultConfig);
    this.config.query += this.config.query.match(/(^|\s)video(\s|\.|$)/) ?
      '' : ' video';
  }

  setup() {
    return new Promise(async (resolve, reject) => {
      /*
      if (this.config.timed.start !== -1) {
        const zone = this.config.timed.zone;

        const now = tz((new Date()).toString(), zone);
        const then = tz(this.config.timed.start, zone);

        const nowMs = now.format('x');
        const thenMs = then.format('x');
        const diff = thenMs - nowMs;

        this.config.timed.diff = diff;
      }
      */

      const root = document.querySelectorAll(this.config.query)[0];

      if (jr.ndef(root)) {
        reject("Unable to find root element for insertion query.");
      }

      // Handle weird, browser-specific DOMExceptions
      root.onerror = (e) => {
        // console.error(e.target.error.message);
        console.error(e);
      };

      /*
      root.addEventListener('waiting', () => {
        console.error("VIDEO FIRED WAITING EVENT");
      });

      root.addEventListener('readystatechange', () => {
        console.log(`VIDEO NOW IN READYSTATE : ${root.readyState}`);
      });
      */

      this.video = root;
      this.paused = true;
      this.loading = false;
      this.started = false;
      this.qualityAuto = true;
      this.qualityQueued = null;
      this.bufferTime = this.config.start;

      if (this.config.timed > 0) { resolve(); return }
      if (this.mpdUpdateInterval) { clearInterval(this.mpdUpdateInterval) }

      await this.init_()
      if (jr.fnc(this.config.hooks.onReady)) {
        this.config.hooks.onReady();
      }

      resolve();
    });
  }

  init_() {
    if (jr.def(this.mpd)) { return Promise.resolve() }

    return new Promise(async resolve => {
      const track = this.config.track;
      const url = this.config.playlist[track].dash.url;
      const base = this.config.playlist[track].dash.base;

      this.mpd = new MPD({ url: url, base: base });
      [this.mpd, this.mpdDownloadSpeed] = await this.mpd.setup();

      this.mediaSource = await this.mediaSource_();
      if (this.usingHLS()) { resolve(); return }

      this.streams = !this.usingHLS() ? await this.buildStreams_(
        this.mpd,
        this.mediaSource
      ) : null;

      if (this.mpd.type === kMPDType.dynamic) {
        this.mpdUpdateInterval = setInterval(async () => {
          [this.mpd, this.mpdDownloadSpeed] = await this.mpd.setup()

          /*
          for (let i=0; i!=this.streams.length; i++) {
            const stream = this.streams[i];
            stream.updateMPD();
          }
          */
        }, this.mpd.updatePeriod);
      }

      resolve();
    });
  }

  buildStreams_(mpd, mediaSource) {
    return new Promise(resolve => {
      let counter = 0;
      let streams = [];

      for (let i = 0; i < mpd.adps.length; i++) {
        const adp = mpd.adps[i];
        const rep = adp.bestRep(this.mpdDownloadSpeed);

        const stream = new Stream({
          adp: adp,
          id: rep.id, // using ID instead of rep for dynamic swapping
          mediaSource: mediaSource,
          mpd: mpd,
          sources: mpd.adps[i].reps,
        });

        stream.setup().then(() => {
          streams.push(stream);
          counter++;

          if (counter === mpd.adps.length) {
            resolve(streams);
          }
        });
      }
    });
  }

  mediaSource_() {
    return new Promise((resolve, reject) => {
      if (this.usingHLS()) {
        const s = `data:${hlsMimeType};base64,${btoa(mpdToM3U8(this))}`;

        this.video.type = hlsMimeType;
        this.video.src = s;

        console.log("streaming via gen-hls");
        resolve(null);
      } else {
        const mediaSource = new MediaSource();

        mediaSource.addEventListener('sourceopen', () => {
          if (mediaSource.readyState === 'open') {
            // console.log("Media source successfully opened");
            console.log("streaming via mpeg-dash");
            resolve(mediaSource);
          } else {
            reject("Unable to open media source!");
          }
        });

        this.video.src = this.url_(mediaSource);
      }
    });
  }

  url_(ms) {
    if (jr.def(ms)) {
      return URL.createObjectURL(ms);
    } else {
      throw("Media source is invalid.");
    }
  }

  adjustQuality(speed = 0, factor = 1.0) {
    // fail if actively buffering
    if (this.loading) { return Promise.resolve(false); }

    this.loading = true;

    return new Promise(async resolve => {
      // handle queued, fixed quality
      if (!this.qualityAuto && this.qualityQueued !== null) {
        const stream = this.qualityQueued.stream;
        const repID = this.qualityQueued.repID;

        this.qualityQueued = null;

        await stream.switchToRep(repID);
        console.log(`Consumed queued rep "${repID}"`);

        this.loading = false;

        if (jr.fnc(this.config.hooks.onAdapt)) {
          this.config.hooks.onAdapt(this.currentBitrate());
        }

        resolve(true);
      // handle automatic quality switching
      } else if (this.qualityAuto) {
        for (let i = 0; i < this.streams.length; i++) {
          const stream = this.streams[i];
          const adp = stream.adp;

          let rep;

          // lower quality if factor > 0.5; raise if < 0.25
          if (factor >= 0.50) {
            const current = this.mpd.repByID(stream.id);
            rep = adp.matchBandwidth(current.bandwidth * 0.8);
          } else {
            rep = adp.matchBandwidth(speed);
          }

          if (stream.id !== rep.id) {
            stream.switchToRep(rep.id).then(() => {
              if (i === this.streams.length - 1) {
                this.loading = false;

                if (jr.fnc(this.config.hooks.onAdapt)) {
                  this.config.hooks.onAdapt(this.currentBitrate());
                }

                resolve(true);
              }
            });
          } else {
            this.loading = false;
            resolve(false);
          }
        }
      } else {
        this.loading = false;
        resolve(false);
      }
    });
  }

  audioStream() {
    if (jr.ndef(this.streams)) { return null }

    for (let i = 0; i != this.streams.length; i++) {
      const stream = this.streams[i];
      if (stream.type === kStreamType.audio ||
          stream.type === kStreamType.muxed) { return stream.rep; }
    }

    return null;
  }

  codecs() {
    return this.streams.map(stream => stream.codecs());
  }

  currentBitrate() {
    const video = this.videoRep();
    if (jr.ndef(video)) { return 0 }

    return video.bandwidth / 1000;
  }

  currentResolution() {
    const video = this.videoRep();
    if (jr.ndef(video)) { return 'uninitialized' }

    return `${video.width}x${video.height}`;
  }

  fillBuffers(defer = null) {
    const dynamic = this.mpd.type === kMPDType.dynamic;

    // fail if actively buffering
    if (this.loading) { return Promise.resolve([0, 0, 0]); }
    if (this.started && this.paused) {
      return Promise.resolve([0, 0, 0]);
    }

    // base line time used for live buffering
    const now = clock.now();
    const lens = this.segmentLengths();
    const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;

    if (dynamic) {
      if (this.lastTime && now - this.lastTime < minTime) {
        return Promise.resolve([0, 0, 0]);
      }
    }

    return new Promise(resolve => {
      // times measured against current and desired state
      const start = this.bufferTime;

      const lead = defer ?
                   defer :
                   (this.started ? this.config.lead : this.config.base);

      // handles case of no known duration (e.g. – dynamic streams)
      const projectedEnd = Math.min(this.mpd.duration, start + lead);
      const end = projectedEnd < 0 ? 0 : projectedEnd;

      // used for measuring speed (in bytes over time delta)
      let payloadSize = 0;
      let payloadStart = clock.init().getTime(), payloadEnd;

      // load-based lock
      this.loading = true;

      // double reducer for serialized Promise returns
      // prevents the need for a (potentially) very large recursion stack
      // derives some logic from: https://stackoverflow.com/a/24985483
      return this.streams.reduce((promise, stream, streamIndex) => {
        return promise.then(() => {
          let points = stream.makePoints(
            start,
            dynamic ? null : end,
            now,
            stream.id
          );

          // remove anything undefined
          points = points.filter(p => jr.def(p));

          // find duplicates (if any); prevents need for forcing delays
          let duplicates = stream.inCache(points);

          // remove already cached point; prevents toe-stepping
          points = points.filter(p => !duplicates.includes(p));
          // if (points.length > 0) { console.log(`points : ${points}`); }

          return points.reduce((promise, point, pointIndex) => {
            return promise.then(() => {
              return stream.fillBuffer(point).then((dataSize) => {
                if (jr.ndef(dataSize)) { resolve([0, 0, 0]); return; }

                const lastStream = streamIndex === this.streams.length-1;
                const lastPoint = pointIndex === points.length - 1;

                // update payload weight
                payloadSize += dataSize;

                if (lastStream && lastPoint) {
                  payloadEnd = clock.init().getTime();

                  // const bufferLength = stream.bufferLength();
                  const delta = (payloadEnd - payloadStart) / 1000;
                  const speedBps = bps(payloadSize, delta);
                  const speedKbps = kbps(payloadSize, delta);
                  const factor = speedFactor(speedKbps, payloadSize, lead);

                  this.bufferTime = end;

                  this.started = true;
                  this.loading = false;

                  this.lastTime = clock.now();

                  console.log(`Buffers filled; download speed: ` +
                              `${speedKbps}kbps, speedFactor: ${factor}`);

                  /*
                  if (this.mpd.dvr && bufferLength > this.mpd.dvr) {
                    stream.popCache(1).then(() => resolve(factor, now));
                  } else {
                    resolve(factor, now);
                  }
                  */

                  resolve([speedBps, factor, now]);
                }
              });
            });
          }, Promise.resolve());
        });
      }, Promise.resolve());
    });
  }

  imageStream() {
    if (jr.ndef(this.streams)) { return null }

    for (let i = 0; i != this.streams.length; i++) {
      const stream = this.streams[i];
      if (stream.type === kStreamType.image) { return stream.rep; }
    }

    return null;
  }

  pause() {
    this.paused = true;

    if (jr.fnc(this.config.hooks.onPause)) {
      this.config.hooks.onPause();
    }

    return this.video.pause();
  }

  play() {
    this.paused = false;
        
    if (jr.fnc(this.config.hooks.onPlay)) {
      this.config.hooks.onPlay();
    }

    return this.video.play();
  }

  queueQuality(quality) {
    const name = quality.name;
    const repID = quality.repID;

    console.log(`name: ${name}, repID: ${repID}`);

    if (name.toLowerCase() === "auto") {
      this.qualityAuto = true;
      this.qualityQueued = null;
      return;
    }

    for (let i = 0; i != this.streams.length; i++) {
      const stream = this.streams[i];

      for (let j = 0; j != stream.sources.length; j++) {
        const source = stream.sources[j];

        if (source.id === repID) {
          this.qualityAuto = false;
          this.qualityQueued = { 
            stream: stream,
            repID: repID,
          };

          return;
        }
      }
    }
  }

  segmentLengths() {
    return this.streams.map(stream => stream.segmentLength());
  }

  usingHLS() {
    if (!hlsPreferred()) { return false; }

    const track = this.config.track;
    const current = this.config.playlist[track];
    const hls = current.hls;
    
    return jr.def(hls) && (hls.gen || hls.url) ? true : false;
  }

  videoRep() {
    let result = null;
    if (jr.ndef(this.streams)) { return result; }

    for (let i = 0; i != this.streams.length; i++) {
      const stream = this.streams[i];
      const rep = stream.rep();
      if (rep.type === kStreamType.video ||
          rep.type === kStreamType.muxed) { result = rep; break }
    }

    return result;
  }
}

export { State };
