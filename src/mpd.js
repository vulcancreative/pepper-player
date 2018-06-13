import Adp from './adp';
import { assert } from './assert';
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

  setup() {
    return new Promise((resolve) => {
      this.fetch_(this.config.url, this.config.data).then((result) => {
        this.parse_(result);
        resolve(this);
      });
    });
  }

  fetch_(url = '', data) {
    return new Promise((resolve, reject) => {
      if (data !== null && typeof data !== 'undefined') {
        resolve(data, 'data');
      }

      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          if (!xhr.response || xhr.response.trim().length < 1) {
            reject("Attempt to fetch MPD failed");
          }

          const dateHeader = xhr.getResponseHeader("Date");
          const serverDate = new Date(dateHeader);
          const now = Date.now();

          console.log(xhr.response);
          console.log(`Date header : ${dateHeader}`);
          console.log(`server vs. local delta : ${serverDate - now}`);

          resolve(xhr.response, 'xml');
        } else {
          reject("Attempt to fetch MPD failed");
        }
      }

      xhr.open('GET', url)
      xhr.send();
    });
  }

  parse_(input = "") {
    assert(input && typeof input !== 'undefined');
    assert(input.length && input.length > 0);

    const baseOverride = this.config.base;
    this.mpd = this.xml_(input);

    assert(this.mpd !== null && typeof this.mpd !== 'undefined');
    assert(this.mpd.children.length > 0);

    // dependency for adp and rep sourcing
    this.baseURL = this.baseURL_(this.mpd, baseOverride);

    this.adps = this.adps_(this.mpd, this.config.url, this.baseURL);
    this.duration = this.duration_(this.mpd);
    this.dvr = this.dvr_(this.mpd);
    this.muxed = this.muxed_(this.mpd);
    this.type = this.type_(this.mpd);
    this.startTime = this.startTime_(this.mpd);
    this.updatePeriod = this.updatePeriod_(this.mpd);

    assert(this.adps !== null && typeof this.adps !== 'undefined');
    assert(typeof this.baseURL !== 'undefined');
    assert(this.duration !== null && typeof this.duration !== 'undefined');
    assert(this.muxed !== null && typeof this.muxed !== 'undefined');
    assert(this.type !== null && typeof this.type !== 'undefined');

    assert(typeof this.startTime !== 'undefined');
    assert(typeof this.updatePeriod !== 'undefined');
  }

  // source adaptations and populate with critical data and metadata
  // mpd === parsed MPD XML
  adps_(mpd, url, override) {
    const period = mpd.querySelectorAll('Period')[0];
    const adaptations = period.querySelectorAll('AdaptationSet');

    if (adaptations && adaptations.length > 0) {
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
    } else {
      throw("No AdaptationSet present in manifest.");
    }
  }

  // gets MPD-level base URL
  // mpd === parsed MPD XML
  baseURL_(mpd, override) {
    let url = '';

    if (typeof override === 'string' || override instanceof String) {
      if (override.length > 0) {
        url = override;
      }
    }

    if (url.length < 1) {
      url = mpd.querySelectorAll('MPD BaseURL')[0];
      url = url && url.textContent ? url.textContent.trim() : '/';
    }

    return url + (url.charAt(url.length - 1) !== '/' ? '/' : '');
  }

  // acquires overall duration, if possible (VoD)
  // mpd === parsed MPD XML
  duration_(mpd) {
    const root = mpd.querySelectorAll('MPD')[0];

    if (root !== null && typeof root !== 'undefined') {
      const durationAttr = root.getAttribute('mediaPresentationDuration');

      if (durationAttr===null ||
          typeof durationAttr==='undefined' ||
          !durationAttr.hasOwnProperty('length') ||
          durationAttr.length < 1) { return -1; }

      return toDuration(durationAttr);
    } else {
      throw("MPD is invalid; unable to source overall duration.");
    }
  }

  // gets max buffer depth, if possible (live)
  // basically, determines how much time is cached, and how
  // far back someone can rewind a live video
  // for static videos, it's assumed one can rewind indefinitely
  dvr_(mpd) {
    const root = mpd.querySelectorAll('MPD')[0];

    if (root !== null && typeof root !== 'undefined') {
      const dvrAttr = root.getAttribute('timeShiftBufferDepth');
     
      if (dvrAttr===null ||
          typeof dvrAttr==='undefined' ||
          !dvrAttr.hasOwnProperty('length') ||
          dvrAttr.length < 1) { return -1; }

      return toDuration(dvrAttr);
    } else {
      throw("MPD is invalid; unable to source time shift buffer depth.");
    }
  }

  // samples a representations codecs
  // if both avc1 and mp4a codecs detected in same rep, true is returned
  // mpd === parsed MPD XML
  muxed_(mpd) {
    const rep = mpd.querySelectorAll('Representation')[0];

    if (rep && typeof rep !== 'undefined') {
      const codecs = rep.getAttribute('codecs');
      if (codecs.includes(',')) {
        let vid = false, aud = false, vID = 'avc', aID = 'mp4';

        const s = codecs.split(',');

        if ((s[0].substring(0,3)==vID) || (s[1].substring(0,3)==vID)) {
          vid = true;
        }

        if ((s[0].substring(0,3)==aID) || (s[1].substring(0,3)==aID)) {
          aud = true;
        }

        if (vid && aud) { return true; }
      }

      return false;
    } else {
      throw("Unable to find Representation within MPD.");
    }
  }

  // determined if we have a live ("dynamic") or vod ("static") stream
  type_(mpd) {
    const root = mpd.querySelectorAll('MPD')[0];

    if (root && typeof root !== 'undefined') {
      let type = root.getAttribute('type');

      if (!type || type.trim() === '') { return null; }
      return type.trim();
    } else {
      throw("MPD is invalid; unable to source type.");
    }
  }

  // acquires availability start time from MPD, if possible (live)
  startTime_(mpd) {
    const root = mpd.querySelectorAll('MPD')[0];
    if (root !== null && typeof root !== 'undefined') {
      const startAttr = root.getAttribute('availabilityStartTime');

      if (startAttr === null || typeof startAttr === 'undefined') {
        return null;
      }

      // WARNING: converting ISO 8601 to Date may not work in old browsers
      return new Date(startAttr);
    } else {
      throw("MPD is invalid; unable to source availabilityStartTime.");
    }
  }

  // acquires MPD update period, if possible (live)
  //) mpd === parsed MPD XML
  updatePeriod_(mpd) {
    const root = mpd.querySelectorAll('MPD')[0];
    if (root !== null && typeof root !== 'undefined') {
      const periodAttr = root.getAttribute('minimumUpdatePeriod');

      if (periodAttr === null || typeof periodAttr === 'undefined') {
        return null;
      }

      return toDuration(periodAttr);
    } else {
      throw("MPD is invalid; unable to source minimumUpdatePeriod.");
    }
  }

  // converts to DOM-accessible XML, if not already in it
  // manifest === manifest string or implicitly parsed MPD XML
  xml_(mpd) {
    let hasDOM = mpd.querySelectorAll ? true : false;

    if (!hasDOM || !mpd.querySelectorAll('Period')[0]) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(mpd, 'text/xml', 0);
      return xml;
    } else if (hasDOM) {
      return mpd;
    } else {
      throw("MPD undefined or unable to be parsed.");
    }
  }
}

export { MPD };
