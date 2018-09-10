import jr from './jr';
import Adp from './adp';
import clock from './clock';
import { bps, pushBpsHistory } from './measure';
import { kMPDType } from './constants';
import { mergeDicts } from './helpers';
import { toDuration } from './convert';

const BLANK = '';
const MPD_STR = 'MPD';
const PREFIX = "Bad ";
const ERR_ADPS = PREFIX + "adps";
const ERR_DURATION = PREFIX + "duration";
const ERR_TYPE = PREFIX + "type";
const ERR_STARTTIME = PREFIX + "start";
const ERR_UPDATEPERIOD = PREFIX + "update";

class MPD {
  constructor(config = {}) {
    const kDefaultConfig = {
      url: BLANK,
      base: BLANK,
      data: null,
    };

    this.config = mergeDicts(config, kDefaultConfig);
    this.fetchedOnce = false;
  }

  async setup() {
    let payloadSize = 0;
    let payloadStart = (new Date()).getTime(), payloadEnd;

    const result = await this.fetch_(this.config.url, this.config.data);

    payloadSize += result.length;
    payloadEnd = (new Date()).getTime();
    
    const delta = (payloadEnd - payloadStart) / 1000;
    pushBpsHistory(bps(payloadSize, delta))

    const err = this.parse_(result);
    if (err) { throw(err); }

    console.log('manifest updated');
    return Promise.resolve(this);
  }

  fetch_(url = BLANK, data) {
    return new Promise(resolve => {
      if (jr.def(data)) {
        resolve(data, 'data');
      }

      const xhr = new XMLHttpRequest;

      xhr.onload = () => {
        const response = xhr.response;

        if (!this.fetchedOnce) {
          console.log(response);
          this.fetchedOnce = true;
        }

        if (jr.def(response)&&response.includes(`${kMPDType.dynamic}`)) {
          const dateHeader = xhr.getResponseHeader('Date');
          const serverTime = new Date(dateHeader);
          clock.sync(serverTime);
        }

        resolve(response, 'xml');
      }

      const timestamp = (new Date()).getTime();
      xhr.open(
        'GET',
        url.includes('?') ?
        `${url}&timestamp=${timestamp}` :
        `${url}?timestamp=${timestamp}`
      );
      xhr.send();
    });
  }

  parse_(input) {
    const url = this.config.url;
    const baseOverride = this.config.base;
    this.mpd = this.xml_(input);

    // dependency for adp and rep sourcing
    this.baseURL = this.baseURL_(this.mpd, baseOverride);
    this.startTime = this.startTime_(this.mpd);
    this.adps = this.adps_(this.mpd, url, this.baseURL, this.startTime);
    this.duration = this.duration_(this.mpd);
    this.dvr = this.dvr_(this.mpd);
    this.muxed = this.muxed_(this.mpd);
    this.type = this.type_(this.mpd);
    this.updatePeriod = this.updatePeriod_(this.mpd);

    if (this.adps < 0) { return ERR_ADPS }

    if (this.type == kMPDType.static && this.duration == -1) {
      return ERR_DURATION
    }

    if (this.type < 0) { return ERR_TYPE }

    // console.log(this.startTime);
    if (this.type == kMPDType.dynamic && (this.startTime == -1 ||
        isNaN(this.startTime) || jr.ndef(this.startTime))) {
      return ERR_STARTTIME
    }

    if (this.type == kMPDType.dynamic && this.updatePeriod < 0) {
      return ERR_UPDATEPERIOD
    }

    return null;
  }

  // source adaptations and populate with critical data and metadata
  // mpd === parsed MPD XML
  adps_(mpd, url, override, startTime) {
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

      adps.push(new Adp(adaptation, i, url, override, startTime));
    }

    return adps;
  }

  // gets MPD-level base URL
  // mpd === parsed MPD XML
  baseURL_(mpd, override) {
    let url = BLANK;

    if (override) { url = `${override}`; }

    if (url.length < 1) {
      url = jr.q('MPD BaseURL', mpd)[0];
      url = url && url.textContent ? url.textContent.trim() : '/';
    }

    return url + (url.charAt(url.length - 1) !== '/' ? '/' : BLANK);
  }

  // acquires overall duration, if possible (VoD)
  // mpd === parsed MPD XML
  duration_(mpd) {
    const root = jr.q(MPD_STR, mpd)[0];
    const durationAttr = jr.a('mediaPresentationDuration', root);

    if (jr.ndef(durationAttr) ||
        !durationAttr.hasOwnProperty('length') ||
        durationAttr.length < 1) { return -1; }

    return toDuration(durationAttr);
  }

  // gets max buffer depth, if possible (live)
  // basically, determines how much time is cached, and how
  // far back someone can rewind a live video
  // for static videos, it's assumed one can rewind indefinitely
  dvr_(mpd) {
    const root = jr.q(MPD_STR, mpd)[0];
    const dvrAttr = jr.a('timeShiftBufferDepth', root);
   
    if (jr.ndef(dvrAttr) ||
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
    const root = jr.q(MPD_STR, mpd)[0];

    let type = jr.a('type', root);

    if (!type || type.trim() === BLANK) { return -1; }
    return type.trim();
  }

  // acquires availability start time from MPD, if possible (live)
  startTime_(mpd) {
    const root = jr.q(MPD_STR, mpd)[0];
    const startAttr = jr.a('availabilityStartTime', root);

    if (jr.ndef(startAttr)) {
      return -1;
    }

    // WARNING: converting ISO 8601 to Date may not work in old browsers
    return clock.parse(startAttr);
  }

  // acquires MPD update period, if possible (live)
  //) mpd === parsed MPD XML
  updatePeriod_(mpd) {
    const root = jr.q(MPD_STR, mpd)[0];
    const periodAttr = jr.a('minimumUpdatePeriod', root);

    if (jr.ndef(periodAttr)) {
      return -1;
    }

    const result = toDuration(periodAttr);
    return result < 1000 ? 1000 : result;
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

  // finds a rep with the given ID string
  repByID(id) {
    for (let i = 0; i < this.adps.length; i++) {
      const adp = this.adps[i];

      for (let j = 0; j < adp.reps.length; j++) {
        const rep = adp.reps[j];
        if (rep.id === id) { return rep; }
      }
    }

    throw(`Unable to find rep with ID '${id}'`);
  }
}

export { MPD };
