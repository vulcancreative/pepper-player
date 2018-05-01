import { MPD } from './mpd';
import { assert } from './assert';
import { Hooker } from './hooker';
import { Stream } from './stream';
import { mergeDicts } from './helpers';
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

class State extends Hooker {
  constructor(config = {}) {
    super();

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

      this.video = root;
      this.loading = false;
      this.started = false;
      this.bufferTime = this.config.start;

      this.mpd = new MPD({ url: url, base: base });
      this.mpd.setup().then(() => console.log("MPD parsed"))
                      .then(() => this.mediaSource_() )
                      .then((mediaSource) => {
                        this.mediaSource = mediaSource;
                      })
                      .then(() => this.buildStreams_(
                          this.mpd,
                          this.mediaSource,
                      ))
                      .then((streams) => {
                        this.streams = streams;
                        resolve();
                      });
    });
  }

  buildStreams_(mpd, mediaSource) {
    return new Promise((resolve, reject) => {
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
      return null;
    }
  }

  adjustQuality(factor = 1.0) {
    // fail if actively buffering
    if (this.loading) { return Promise.resolve(); }

    this.loading = true;

    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.streams.length; i++) {
        const stream = this.streams[i];
        const adp = stream.adp;

        let rep;

        // lower quality if factor > 0.5; raise if < 0.25
        if (factor >= 0.45) {
          rep = adp.weakerRep(stream.rep.id);
        } else if (factor <= 0.20) {
          rep = adp.strongerRep(stream.rep.id);
        } else {
          this.loading = false;
          resolve();

          return;
        }

        assert(rep !== null && typeof rep !== 'undefined',
               "rep invalid within adjustQuality");

        stream.switchToRep(rep.id).then(() => {
          if (i === this.streams.length - 1) {
            this.loading = false;
            resolve();
          }
        });
      }
    });
  }

  codecs() {
    return this.streams.map(stream => stream.codecs());
  }

  fillBuffers() {
    // fail if actively buffering
    if (this.loading) { return Promise.resolve(); }

    return new Promise((resolve, reject) => {
      // times measured against current and desired state
      const start = this.bufferTime;
      const lead = this.started ? this.config.lead : this.config.base;
      const end = Math.min(this.mpd.duration, start + lead);

      // used for measuring speed (in bytes)
      let payloadSize = 0;
      let payloadStart = (new Date()).getTime(), payloadEnd;

      // load-based lock
      this.loading = true;

      // double reducer for serialized Promise returns
      // prevents the need for a (potentially) very large recursion stack
      // derives some logic from: https://stackoverflow.com/a/24985483
      return this.streams.reduce((promise, stream, streamIndex) => {
        return promise.then(() => {
          const points = stream.makePoints(start, end);

          /*
          if (stream.inCache(points)) {
            console.log("point found, returning...");
            return;
          }
          */

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

                  console.log(`Buffers filled; download speed: ` +
                              `${speed}kbps, speedFactor: ${factor}`);

                  resolve(factor);
                }
              });
            });
          }, Promise.resolve());
        });
      }, Promise.resolve());
    });
  }
}

export { State };
