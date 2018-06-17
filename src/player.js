import jr from './jr';
import { os } from './os';
import { State } from './state';
import { mergeDicts } from './helpers';

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
      query:  ".pepper",
      start:  0,
      timed:  0,
      track:  0,
      ui:     true,
    };

    this.config = mergeDicts(config, kDefaultConfig);
    this.setup_();
  }

  async setup_() {
    if (!this.config.query.length || this.config.query.length < 1) {
      throw("Invalid insertion query.");
    }

    if (this.config.base < 100) { this.config.base = 100; }
    if (this.config.lead < 1000) { this.config.lead = 1000; }

    this.renderUI();
    this.state = new State(this.config);

    await this.state.setup();
    console.log("State ready");

    const diff = this.state.config.timed;

    if (diff > 0) {
      this.startsInMs = diff;

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
  }

  async init_() {
    await this.state.init_();

    const [speed, now] = await this.state.fillBuffers();
    const type = this.state.mpd.type;

    if (type === 'dynamic') {
      this.safariStartTime = now / 1000;
    }

    await this.state.adjustQuality(speed);

    if (this.config.auto) {
      if (type === 'dynamic' && os.is('safari')) {
        const start = this.safariStartTime;
        this.state.video.currentTime = start;
      }

      this.play();
    }

    return Promise.resolve()
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

  async play() {
    const type = this.state.mpd.type;
    await this.state.play();

    if (type === 'static') {
      this.state.video.ontimeupdate = async () => {
        const currentTime = this.currentTime();
        const bufferTime = this.bufferTime();
        const leadTime = this.config.lead;

        this.renderUI();

        if (currentTime >= bufferTime - leadTime / 2) {
          const speed = await this.state.fillBuffers();
          this.state.adjustQuality(speed);
        }

        if (this.didEnd()) {
          this.state.video.currentTime = 0;
          if (!this.config.loop) { this.pause(); }
        }

        return Promise.resolve();
      };
    } else if (type === 'dynamic') {
      const lens = this.state.segmentLengths();
      const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;
      const maxTime = lens.reduce((a,b) => Math.max(a,b));
      const waitTime = this.lastSpeed ?
                       minTime - minTime * this.lastSpeed : minTime;

      this.state.video.ontimeupdate = () => this.renderUI();

      setInterval(async () => {
        const speed = await this.state.fillBuffers(maxTime);
        this.lastSpeed = speed;

        if (this.config.auto && !this.isPaused()) {
          this.state.play();
        }

        this.state.adjustQuality(speed);

        return Promise.resolve();
      }, waitTime);
    }
  }

  previous() {
    // TODO
  }

  renderUI() {
    if (!this.injected) {
      const injectPoint = jr.q(this.config.query)[0];
      const video = document.createElement('video');
      injectPoint.innerHTML = video.outerHTML;

      this.injected = true;
    }
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

export default Player;
export { Player };
