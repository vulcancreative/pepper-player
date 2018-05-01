import { State } from './state';
import { assert } from './assert';
import { Hooker } from './hooker';
import { mergeDicts } from './helpers';

class Player extends Hooker {
  constructor(config = {}) {
    super()

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
      lead:   5000,
      loop:   false,
      query:  "video.pepper",
      start:  0,
      track:  0,
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
                      .then(() => this.state.fillBuffers())
                      .then((speed) => this.state.adjustQuality(speed))
                      .then(() => {
                        if (this.config.auto) { this.play(); }
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
    return this.state.video.play().then(() => {
      this.state.video.ontimeupdate = () => {
        const currentTime = this.currentTime();
        const bufferTime = this.bufferTime();
        const leadTime = this.config.lead;

        if (currentTime >= bufferTime - leadTime / 2) {
          this.state.fillBuffers().then((speed) => {
            this.state.adjustQuality(speed)
          });
        }

        if (this.currentTime() >= this.duration()) {
          this.state.video.currentTime = 0;
          if (!this.config.loop) { this.state.video.pause(); }
        }
      };
    });
  }

  previous() {
    // TODO
  }

  seek() {
    // TODO
  }
}

export {
  Player,
};
