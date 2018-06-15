import jr from './jr';
import Adp from './adp';
import { mergeDicts } from './helpers';
import { toDuration } from './convert';

class MPD {
  constructor(config = {}) {
    const kDefaultConfig = {
      url: "",
      base: "",
      data: null,
    };

    this.config = mergeDicts(config, kDefaultConfig);
  }

  async setup() {
    const result = await this.fetch_(this.config.url, this.config.data);
    const err = this.parse_(result);
    if (err) { throw(err); }

    return this;
  }

  fetch_(url = '', data) {
    return new Promise(resolve => {
      if (data !== null && typeof data !== 'undefined') {
        resolve(data, 'data');
      }

      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        const dateHeader = xhr.getResponseHeader("Date");
        const serverDate = new Date(dateHeader);
        const now = Date.now();

        console.log(xhr.response);
        console.log(`Date header : ${dateHeader}`);
        console.log(`server vs. local delta : ${serverDate - now}`);

        resolve(xhr.response, 'xml');
      }

      xhr.open('GET', url)
      xhr.send();
    });
  }

  parse_(input = "") {
    const baseOverride = this.config.base;
    this.mpd = this.xml_(input);

    // dependency for adp and rep sourcing
    this.baseURL = this.baseURL_(this.mpd, baseOverride);

    this.adps = this.adps_(this.mpd, this.config.url, this.baseURL);
    this.duration = this.duration_(this.mpd);
    this.dvr = this.dvr_(this.mpd);
    this.muxed = this.muxed_(this.mpd);
    this.type = this.type_(this.mpd);
    this.startTime = this.startTime_(this.mpd);
    this.updatePeriod = this.updatePeriod_(this.mpd);

    if (this.adps < 0) { return "Bad adps"; }

    if (this.type == 'static' && this.duration == -1) {
      return "Bad duration";
    }

    if (this.type < 0) { return "Bad type"; }

    if (this.type == 'dynamic' && this.startTime < 0) {
      return "Bad start time";
    }

    if (this.type == 'dynamic' && this.updatePeriod < 0) {
      return "Bad update period";
    }

    return null;
  }

  // source adaptations and populate with critical data and metadata
  // mpd === parsed MPD XML
  adps_(mpd, url, override) {
    const period = jr.q('Period', mpd)[0];
    const adaptations = jr.q('AdaptationSet', period);

    if (!adaptations || adaptations.length < 1) { return -1; }

    const adps = [];

    for (let i = 0; i != adaptations.length; i++) {
      const adaptation = adaptations[i];
      /*
      const mimeType = adaptation.getAttribute('mimeType');

      if (!mimeType.includes('audio') && !mimeType.includes('video')) {
        continue;
      }
      */

      adps.push(new Adp(adaptation, i, url, override));
    }

    return adps;
  }

  // gets MPD-level base URL
  // mpd === parsed MPD XML
  baseURL_(mpd, override) {
    let url = '';

    if (override) { url = `${override}`; }

    if (url.length < 1) {
      url = jr.q('MPD BaseURL', mpd)[0];
      url = url && url.textContent ? url.textContent.trim() : '/';
    }

    return url + (url.charAt(url.length - 1) !== '/' ? '/' : '');
  }

  // acquires overall duration, if possible (VoD)
  // mpd === parsed MPD XML
  duration_(mpd) {
    const root = jr.q('MPD', mpd)[0];
    const durationAttr = jr.a('mediaPresentationDuration', root);

    if (durationAttr===null ||
        typeof durationAttr==='undefined' ||
        !durationAttr.hasOwnProperty('length') ||
        durationAttr.length < 1) { return -1; }

    return toDuration(durationAttr);
  }

  // gets max buffer depth, if possible (live)
  // basically, determines how much time is cached, and how
  // far back someone can rewind a live video
  // for static videos, it's assumed one can rewind indefinitely
  dvr_(mpd) {
    const root = jr.q('MPD', mpd)[0];
    const dvrAttr = jr.a('timeShiftBufferDepth', root);
   
    if (dvrAttr===null ||
        typeof dvrAttr==='undefined' ||
        !dvrAttr.hasOwnProperty('length') ||
        dvrAttr.length < 1) { return -1; }

    return toDuration(dvrAttr);
  }

  // samples a representations codecs
  // if both avc1 and mp4a codecs detected in same rep, true is returned
  // mpd === parsed MPD XML
  muxed_(mpd) {
    const rep = jr.q('Representation', mpd)[0];
    if (!rep) { return -1; }

    const codecs = jr.a('codecs', rep);
    return codecs.includes('avc') && codecs.includes('mp4');
  }

  // determined if we have a live ("dynamic") or vod ("static") stream
  type_(mpd) {
    const root = jr.q('MPD', mpd)[0];

    let type = jr.a('type', root);

    if (!type || type.trim() === '') { return -1; }
    return type.trim();
  }

  // acquires availability start time from MPD, if possible (live)
  startTime_(mpd) {
    const root = jr.q('MPD', mpd)[0];
    const startAttr = jr.a('availabilityStartTime', root);

    if (startAttr === null || typeof startAttr === 'undefined') {
      return -1;
    }

    // WARNING: converting ISO 8601 to Date may not work in old browsers
    return new Date(startAttr);
  }

  // acquires MPD update period, if possible (live)
  //) mpd === parsed MPD XML
  updatePeriod_(mpd) {
    const root = jr.q('MPD', mpd)[0];
    const periodAttr = jr.a('minimumUpdatePeriod', root);

    if (periodAttr === null || typeof periodAttr === 'undefined') {
      return -1;
    }

    return toDuration(periodAttr);
  }

  // converts to DOM-accessible XML, if not already in it
  // manifest === manifest string or implicitly parsed MPD XML
  xml_(mpd) {
    let hasDOM = mpd.querySelectorAll ? true : false;

    if (!hasDOM) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(mpd, 'text/xml', 0);
      return xml;
    }

    return mpd;
  }
}

export { MPD };
