import React from 'react';
import ReactDOM from 'react-dom';
// import { os } from './os';
import { TestUI } from './ui';
import { State } from './state';
import { mergeDicts } from './helpers';
import { kStreamType } from './constants';

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
      query:  "video.pepper",
      start:  0,
      track:  0,
      ui:     {
        qualityControl:  true,
      }
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

    this.state = new State(this.config);
    this.state.setup().then(() => console.log("State ready"))
                      .then(() => this.renderUI())
                      .then(() => this.state.fillBuffers())
                      .then((speed, now) => {
                        const type = this.state.mpd.type;
                        if (type === 'dynamic') {
                          this.safariStartTime = now / 1000;
                        }

                        return this.state.adjustQuality(speed);
                      })
                      .then(() => {
                        // const type = this.state.mpd.type;
                        if (this.config.auto) {
                          /*
                          if (type === 'dynamic' && os.is('safari')) {
                            const start = this.safariStartTime;
                            this.state.video.currentTime = start;
                          }
                          */

                          this.play();
                        }
                      });
  }

  bufferTime() {
    return this.state.bufferTime;
  }

  currentTime() {
    return this.state.video.currentTime * 1000;
  }

  didEnd() {
    return this.currentTime() >= this.duration();
  }

  duration() {
    return this.state.mpd.duration;
  }

  isPaused() {
    // TODO
    
    return false;
  }

  makeActive() {
    // TODO
  }

  next() {
    // TODO
  }

  pause() {
    return this.state.video.pause();
  }

  play() {
    const type = this.state.mpd.type;

    if (type === 'static') {
      return this.state.video.play().then(() => {
        this.state.video.ontimeupdate = () => {
          const currentTime = this.currentTime();
          const bufferTime = this.bufferTime();
          const leadTime = this.config.lead;

          if (currentTime >= bufferTime - leadTime / 2) {
            this.state.fillBuffers().then((speed) => {
              this.state.adjustQuality(speed).then((adjusted) => {
                if (adjusted) { this.renderUI(); }
              });
            });
          }

          if (this.currentTime() >= this.duration()) {
            this.state.video.currentTime = 0;
            if (!this.config.loop) { this.state.video.pause(); }
          }
        };
      });
    } else if (type === 'dynamic') {
      const lens = this.state.segmentLengths();
      const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;
      const maxTime = lens.reduce((a,b) => Math.max(a,b));
      const waitTime = this.lastSpeed ?
                      minTime - minTime * this.lastSpeed : minTime;

      setInterval(() => {
        // console.log("ATTEMPTING LIVE BUFFER");

        this.state.fillBuffers(maxTime).then((speed) => {
          this.lastSpeed = speed;

          if (this.config.auto && !this.isPaused()) {
            this.state.video.play();
          }

          this.state.adjustQuality(speed).then((adjusted) => {
            if (adjusted) { this.renderUI(); }
          });
        });
      }, waitTime);
    }

    return null;
  }

  previous() {
    // TODO
  }

  renderUI() {
    const UI = this.debug ? TestUI : null;
    if (!UI) { return; }

    const id = this.state.videoStream().id;

    const videoQualities = () => {
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

    ReactDOM.render(
      <UI id={id} qualities={videoQualities()}
      guts={this.state} config={this.config.ui} />,
      document.querySelectorAll('.root')[0],
      document.querySelectorAll('.pepper-ui')[0]
    );
  }

  seek() {
    // TODO
  }
}

export {
  Player,
};
