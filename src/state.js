import { MPD } from './mpd';
import { assert } from './assert';
import { Stream } from './stream';
import { mergeDicts } from './helpers';
import { kStreamType } from './constants';
import { kbps, speedFactor } from './measure';

/*
// TODO: move within class structure
// merge passed config with default config; returning assembled config
function configure(config, kDefaultConfig) {
  assert(config);
  assert(kDefaultConfig);

  mergedConfig = mergeDicts(config, kDefaultConfig);
  mergedConfig.playlist = validatePlaylist(mergedConfig.playlist);

  return mergedConfig;
}
*/

class State {
  constructor(config = {}) {
    const kDefaultConfig = {
      playlist: [],
      base:   0,
      lead:   0,
      start:  0,
      track:  0,
      query:  "",
    };

    this.config = mergeDicts(config, kDefaultConfig);
  }

  setup() {
    return new Promise((resolve, reject) => {
      const track = this.config.track;
      const url = this.config.playlist[track].dash.url;
      const base = this.config.playlist[track].dash.base;

      const root = document.querySelectorAll(this.config.query)[0];

      if (root === null || typeof root === 'undefined') {
        reject("Unable to find root element for insertion query.");
      }

      // Handle weird, browser-specific DOMExceptions
      root.onerror = (e) => {
        console.error(e.target.error.message);
      };

      root.addEventListener('waiting', () => {
        console.error("VIDEO FIRED WAITING EVENT");
      });

      root.addEventListener('readystatechange', () => {
        console.log(`VIDEO NOW IN READYSTATE : ${root.readyState}`);
      });

      this.video = root;
      this.loading = false;
      this.started = false;
      this.qualityAuto = true;
      this.qualityQueued = null;
      this.bufferTime = this.config.start;

      this.mpd = new MPD({ url: url, base: base });
      this.mpd.setup().then(() => console.log("MPD parsed"))
                      .then(() => this.mediaSource_())
                      .then((mediaSource) => {
                        this.mediaSource = mediaSource;
                      })
                      .then(() => this.buildStreams_(
                          this.mpd,
                          this.mediaSource
                      ))
                      .then((streams) => {
                        this.streams = streams;
                        resolve();
                      });
    });
  }

  buildStreams_(mpd, mediaSource) {
    return new Promise((resolve) => {
      let counter = 0;
      let streams = [];

      for (let i = 0; i < mpd.adps.length; i++) {
        const adp = mpd.adps[i];
        const rep = adp.reps[adp.bestRep()];
        assert(rep !== null && typeof rep !== 'undefined');

        const stream = new Stream({
          mediaSource: mediaSource,
          mpd: mpd,
          adp: adp,
          rep: rep,
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
      const mediaSource = new MediaSource();

      assert(mediaSource !== null);
      assert(typeof mediaSource !== 'undefined');

      mediaSource.addEventListener('sourceopen', () => {
        if (mediaSource.readyState === 'open') {
          console.log("Media source successfully opened");
          resolve(mediaSource);
        } else {
          reject("Unable to open media source!");
        }
      });

      const src = this.url_(mediaSource);

      assert(src !== null && typeof src !== 'undefined');
      assert(src.length > 0);

      this.video.src = src;
      console.log(this.video);
    });
  }

  url_(ms) {
    if (ms !== null && typeof ms !== 'undefined') {
      return URL.createObjectURL(ms);
    } else {
      throw("Media source is invalid.");
    }
  }

  adjustQuality(factor = 1.0) {
    // fail if actively buffering
    if (this.loading) { return Promise.resolve(false); }

    this.loading = true;

    return new Promise((resolve) => {
      // handle queued, fixed quality
      if (!this.qualityAuto && this.qualityQueued !== null) {
        const stream = this.qualityQueued.stream;
        const repID = this.qualityQueued.repID;

        this.qualityQueued = null;

        stream.switchToRep(repID).then(() => {
          console.log(`Consumed queued rep "${repID}"`);
          this.loading = false;
          resolve(true);
        });
      // handle automatic quality switching
      } else if (this.qualityAuto) {
        for (let i = 0; i < this.streams.length; i++) {
          const stream = this.streams[i];
          const adp = stream.adp;
          let rep;

          // lower quality if factor > 0.5; raise if < 0.25
          if (factor >= 0.60) {
            rep = adp.weakerRep(stream.rep.id);
          } else if (factor <= 0.30) {
            rep = adp.strongerRep(stream.rep.id);
          } else {
            this.loading = false;
            resolve(false);
            return;
          }

          assert(rep !== null && typeof rep !== 'undefined',
                 "rep invalid within adjustQuality");

          stream.switchToRep(rep.id).then(() => {
            if (i === this.streams.length - 1) {
              this.loading = false;
              resolve(true);
            }
          });
        }
      } else {
        this.loading = false;
        resolve(false);
      }
    });
  }

  audioStream() {
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

  fillBuffers(defer = null) {
    console.log(this.mpd);

    const dynamic = this.mpd.type === 'dynamic';

    // fail if actively buffering
    if (!dynamic && this.loading) { return Promise.resolve(); }

    // base line time used for live buffering
    const now = Date.now();
    const lens = this.segmentLengths();
    const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;

    if (dynamic) {
      if (this.lastTime && now - this.lastTime < minTime) {
        return Promise.resolve();
      }

      // console.log(`time delta (ms) : ${now - this.lastTime}`);
    }

    return new Promise((resolve) => {
      // times measured against current and desired state
      const start = this.bufferTime;
      const lead = defer ? defer :
                   (this.started ? this.config.lead : this.config.base);
      const end = Math.min(this.mpd.duration, start + lead);

      // used for measuring speed (in bytes over time delta)
      let payloadSize = 0;
      let payloadStart = (new Date()).getTime(), payloadEnd;

      // load-based lock
      if (!dynamic) { this.loading = true; }

      // double reducer for serialized Promise returns
      // prevents the need for a (potentially) very large recursion stack
      // derives some logic from: https://stackoverflow.com/a/24985483
      return this.streams.reduce((promise, stream, streamIndex) => {
        return promise.then(() => {
          let points = stream.makePoints(
            dynamic ? null : start,
            dynamic ? null : end,
            now
          );

          let duplicates = stream.inCache(points);

          // remove already cached point; prevents toe-stepping
          points = points.filter(p => !duplicates.includes(p));
          // console.log(points);

          return points.reduce((promise, point, pointIndex) => {
            return promise.then(() => {
              return stream.fillBuffer(point).then((dataSize) => {
                const lastStream = streamIndex === this.streams.length - 1;
                const lastPoint = pointIndex === points.length - 1;

                // update payload weight
                payloadSize += dataSize;

                if (lastStream && lastPoint) {
                  payloadEnd = (new Date()).getTime();

                  const delta = (payloadEnd - payloadStart) / 1000;
                  const speed = kbps(payloadSize, delta);
                  const factor = speedFactor(speed, payloadSize, lead);

                  this.bufferTime = end;

                  this.started = true;
                  this.loading = false;

                  if (dynamic) { this.lastTime = now; }

                  console.log(`Buffers filled; download speed: ` +
                              `${speed}kbps, speedFactor: ${factor}`);

                  resolve(factor, now);
                }
              });
            });
          }, Promise.resolve());
        });
      }, Promise.resolve());
    });
  }

  queueQuality(quality) {
    assert(quality !== null && typeof quality !== 'undefined');

    const name = quality.name;
    const repID = quality.repID;

    assert(name !== null && typeof name !== 'undefined');
    assert(repID !== null && typeof repID !== 'undefined');

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

        assert(source !== null && typeof source !== 'undefined');
        assert(source.id !== null && typeof source.id !== 'undefined');

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

  videoStream() {
    for (let i = 0; i != this.streams.length; i++) {
      const stream = this.streams[i];
      if (stream.type === kStreamType.video ||
          stream.type === kStreamType.muxed) { return stream.rep; }
    }

    return null;
  }
}

export { State };
