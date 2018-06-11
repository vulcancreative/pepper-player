import { os } from './os';
import React from 'react';
import { State } from './state';
import ReactDOM from 'react-dom';
import { mergeDicts } from './helpers';
import { kStreamType } from './constants';
import { UI as LiveUI } from './production/ui';
import { UI as TestUI } from './development/ui';

class Player {
  constructor(config = {}) {
    const kDefaultConfig = {
      playlist: [
        // {
          // dash: {
            // url:    null,
            // base:   null,
          // },
          // hls: {
            // url:    null,
            // gen:    null,
          // },
        // },
      ],

      auto:   true,
      adapt:  true,
      base:   1000,
      debug:  false,
      lead:   5000,
      loop:   false,
      query:  ".pepper video",
      start:  0,
      timed:  { start: -1, zone: 'America/Los_Angeles', diff: -1 },
      track:  0,
      ui:     true,
    };

    this.config = mergeDicts(config, kDefaultConfig);
    this.setup_();
  }

  setup_() {
    if (!this.config.query.length || this.config.query.length < 1) {
      throw("Invalid insertion query.");
    }

    if (this.config.base < 100) { this.config.base = 100; }
    if (this.config.lead < 1000) { this.config.lead = 1000; }

    this.renderUI();
    this.state = new State(this.config);
    this.state.setup().then(() => console.log("State ready"))
                      .then(() => {
                        this.renderUI();

                        const diff = this.state.config.timed.diff;
                        if (diff > 0) {
                          this.startsInMs = diff;
                          this.renderUI();

                          setTimeout(() => {
                            this.startsInMs = diff >= 1000 ?
                              diff - 1000 : diff;

                            this.renderUI();

                            this.updateTimer_(
                              diff >= 1000 ? diff - 1000 : diff
                            );
                          }, 1000);
                          return;
                        }

                        this.init_();
                      });
  }

  init_() {
    this.state.init_().then(() => {
      this.state.fillBuffers().then((speed, now) => {
        const type = this.state.mpd.type;
        if (type === 'dynamic') {
          this.safariStartTime = now / 1000;
        }

        return this.state.adjustQuality(speed);
      })
      .then(() => {
        const type = this.state.mpd.type;
        if (this.config.auto) {
          if (type === 'dynamic' && os.is('safari')) {
            const start = this.safariStartTime;
            this.state.video.currentTime = start;
          }

          this.play();
        }
      });
    });
  }

  bufferTime() {
    return this.state.bufferTime;
  }

  currentTime() {
    if (this.state===null || typeof this.state==='undefined') {
      return 0;
    }

    if (this.state.video===null || typeof this.state.video==='undefined') {
      return 0;
    }

    return this.state.video.currentTime * 1000;
  }

  didEnd() {
    return Math.round(this.currentTime() / 1000) * 1000 >= this.duration();
  }

  duration() {
    return this.state.mpd.duration;
  }

  isPaused() {
    if (this.state === null || typeof this.state === 'undefined') {
      return true;
    }

    return this.state.paused;
  }

  makeActive() {
    // TODO
  }

  next() {
    // TODO
  }

  pause() {
    return this.state.pause();
  }

  play() {
    const type = this.state.mpd.type;

    return this.state.play().then(() => {
      if (type === 'static') {
        this.state.video.ontimeupdate = () => {
          const currentTime = this.currentTime();
          const bufferTime = this.bufferTime();
          const leadTime = this.config.lead;

          this.renderUI();

          if (currentTime >= bufferTime - leadTime / 2) {
            this.state.fillBuffers().then((speed) => {
              this.state.adjustQuality(speed);
            });
          }

          if (this.didEnd()) {
            this.state.video.currentTime = 0;
            if (!this.config.loop) { this.pause(); }
          }
        };
      } else if (type === 'dynamic') {
        const lens = this.state.segmentLengths();
        const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;
        const maxTime = lens.reduce((a,b) => Math.max(a,b));
        const waitTime = this.lastSpeed ?
                        minTime - minTime * this.lastSpeed : minTime;

        this.state.video.ontimeupdate = () => this.renderUI();

        setInterval(() => {
          this.state.fillBuffers(maxTime).then((speed) => {
            this.lastSpeed = speed;

            if (this.config.auto && !this.isPaused()) {
              this.state.play();
            }

            this.state.adjustQuality(speed);
          });
        }, waitTime);
      }
    });
  }

  previous() {
    // TODO
  }

  renderUI() {
    let id = 0;
    let videoQualities = () => { return null; };

    const UI = process.env.NODE_ENV === 'development' ? TestUI : LiveUI;
    // if (!UI || !this.state.video.controls) { return; }

    if (this.state && this.state.video) {
      const stream = this.state.videoStream();

      if (stream) {
        id = stream.id;

        videoQualities = () => {
          const mpd = this.state.mpd;
          const adps = mpd.adps;
          
          let qualities = [];

          for (let i = 0; i != adps.length; i++) {
            const adp = adps[i];

            if (adp.reps.length < 1) { continue; }

            for (let j = 0; j != adp.reps.length; j++) {
              const rep = adp.reps[j];

              if (rep.type === kStreamType.video) {
                const width = rep.width;
                const height = rep.height;

                qualities.push({
                  name: `${width}:${height}`,
                  repID: rep.id,
                  selected: !this.state.qualityAuto && id === rep.id,
                  weight: adp.reps[j].weight(),
                });
              }
            }
          }

          qualities.sort((a, b) => a.weight > b.weight);
          qualities.unshift({
            name: "auto",
            repID: id,
            selected: this.state.qualityAuto,
            weight: -1,
          });

          return qualities;
        };
      }
    }

    ReactDOM.render(
      <UI id={id}
          startsInMs={this.startsInMs}
          qualities={videoQualities()}
          guts={this.state}
          config={this.config.ui}
          seek={(p) => this.seek(p)}
          play={() => this.play()}
          pause={() => this.pause()}
          isPaused={() => this.isPaused()}
          currentTime={() => this.currentTime()}
      />,
      document.querySelectorAll('div.pepper')[0],
      document.querySelectorAll('div.pepper')[0]
    );
  }

  seek(percentage) {
    if (percentage === null || typeof percentage === 'undefined') {
      return;
    }

    const time = this.state.mpd.duration * (percentage / 100);
    this.config.start = time;

    this.pause();
    this.setup_();
  }

  updateTimer_(diff) {
    if (diff <= 0) { this.init_(); return; }

    setTimeout(() => {
      this.startsInMs -= 1000;
      this.renderUI();
      this.updateTimer_(diff > 0 ? diff - 1000 : 0)
    }, 1000);
  }
}

export {
  Player,
};
