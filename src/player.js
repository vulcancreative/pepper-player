import jr from './jr';
import { os } from './os';
import { State } from './state';
import { mergeDicts } from './helpers';
import { kMPDType } from './constants';

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

      hooks: {
        // onReady: 0,
        // onPlay: 0,
        // onPause: 0,
        // onStop: 0,
        // onSeek: 0,
        // onStallStarted: 0,
        // onStallEnded: 0,
        // onError: 0,
        // onAdapt: 0,
      },
        
      auto:   true,
      adapt:  true,
      base:   os.is('edge') ? 5000 : 1000,
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

    this.lazyStart = false;
    this.initialized = false;

    // console.log(this.config.hooks.onReady);

    /*
    this.config.hooks.onReady();
    this.config.hooks.onAdapt(2000);
    this.config.hooks.onPlay();
    this.config.hooks.onAdapt(1000);
    this.config.hooks.onPause();
    this.config.hooks.onPlay();
    */

    if (this.config.playlist.length > 0) { this.setup_(); }
  }

  async setup_() {
    this.initialized = true;

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

      /*
      setTimeout(() => {
        this.startsInMs = diff >= 1000 ?
          diff - 1000 : diff;

        // this.renderUI();

        this.updateTimer_(
          diff >= 1000 ? diff - 1000 : diff
        );
      }, 1000);
      */

      return;
    }

    this.init_();
  }

  async init_() {
    await this.state.init_();

    if (!this.state.usingHLS()) {
      const [speed, factor, now] = await this.state.fillBuffers();
      const type = this.state.mpd.type;

      if (type === kMPDType.dynamic) {
        this.safariStartTime = now / 1000;
      }

      await this.state.adjustQuality(speed, factor)   

      if (this.config.auto) {
        if (type === kMPDType.dynamic && os.is('safari')) {
          const start = this.safariStartTime;
          this.state.video.currentTime = start;
        }

        if (!this.lazyStart) { this.play(); }
      }
    }
    
    return Promise.resolve()
  }

  bufferTime() {
    return this.state.bufferTime;
  }

  currentBitrate() {
    return this.state.currentBitrate();
  }

  currentResolution() {
    return this.state.currentResolution();
  }

  currentTime() {
    if (jr.ndef(this.state) || jr.ndef(this.state.video)) { return 0; }
    return this.state.video.currentTime * 1000;
  }

  didEnd() {
    return Math.round(this.currentTime() / 1000) * 1000 >= this.duration();
  }

  duration() {
    return this.state.mpd.duration;
  }

  isPaused() {
    if (jr.ndef(this.state)) { return true; }
    return this.state.paused;
  }

  /*
  makeActive() {
    // TODO
  }

  next() {
    // TODO
  }
  */

  pause() {
    return this.state.pause();
  }

  async play() {
    if (!this.initialized) { this.lazyStart = true; await this.setup_() }

    const type = this.state.mpd.type;
    await this.state.play();

    if (type === kMPDType.static) {
      this.state.video.ontimeupdate = async () => {
        const currentTime = this.currentTime();
        const bufferTime = this.bufferTime();
        const leadTime = this.config.lead;

        // this.renderUI();

        if (currentTime >= bufferTime - leadTime / 2) {
          const [speed, factor] = await this.state.fillBuffers();
          this.state.adjustQuality(speed, factor);
        }

        if (this.didEnd()) {
          this.state.video.currentTime = 0;
          if (!this.config.loop) {
            this.pause();
          }
        }

        return Promise.resolve();
      };
    } else if (type === kMPDType.dynamic) {
      const lens = this.state.segmentLengths();
      const minTime = lens.reduce((a,b) => Math.min(a,b)) / 2;
      const maxTime = lens.reduce((a,b) => Math.max(a,b));
      const waitTime = this.lastSpeed ?
                       maxTime - minTime * this.lastSpeed : minTime;

      // this.state.video.ontimeupdate = () => this.renderUI();

      setInterval(async () => {
        const [speed, factor] = await this.state.fillBuffers(maxTime);
        this.lastSpeed = speed;

        if (this.config.auto && !this.isPaused()) {
          await this.state.play();
        }

        this.state.adjustQuality(speed, factor);

        return Promise.resolve();
      }, waitTime);
    }
  }

  /*
  previous() {
    // TODO
  }
  */

  renderUI() {
    if (!this.injectedUI) {
      const injectPoint = jr.q(this.config.query)[0];
      const vidExists = jr.q('video', injectPoint)[0];

      if (!vidExists) {
        const hls = this.state && this.state.usingHLS();
        const video = document.createElement('video');

        video.controls = false;
        video.autoplay = this.config.auto && !hls;
        video.addEventListener('click', () => {
          this.state.video.play().catch((e) => console.log(e));
        });

        injectPoint.appendChild(video);
      }

      this.injectedUI = true;
    }
  }

  seek(percentage) {
    if (jr.ndef(percentage)) { return }

    const time = this.state.mpd.duration * (percentage / 100);
    this.config.start = time;

    this.pause();
    this.setup_();
  }

  /*
  updateTimer_(diff) {
    if (diff <= 0) { this.init_(); return }

    setTimeout(() => {
      this.startsInMs -= 1000;
      // this.renderUI();
      this.updateTimer_(diff > 0 ? diff - 1000 : 0)
    }, 1000);
  }
  */

  volume(value = -1) {
    if (jr.ndef(this.state) || jr.ndef(this.state.video)) { return -1 }
    if (value > -1 && value <= 1) { this.state.video.volume = value }
    return this.state.video.volume;
  }
}

export default Player;
export { Player };
