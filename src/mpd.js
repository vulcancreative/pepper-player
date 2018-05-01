import { assert } from './assert';
import { Hooker } from './hooker';
import { mergeDicts } from './helpers';
import { toInt, toDuration } from './convert';

class Rep {
  constructor(adp, rep, override) {
    let id, codecs, width, height, bandwidth, baseURL,
    initialization, mediaTemplate, segmentTemplate, startNumber,
    timescale, mimeType, segmentDuration;

    // source id from rep attribute
    id = rep.getAttribute('id');

    // mimeType can be on either the adp or the rep
    mimeType = adp.getAttribute('mimeType');
    if (!mimeType || typeof mimeType === 'undefined') {
      mimeType = rep.getAttribute('mimeType');
    }

    // source codecs from rep attribute
    codecs = rep.getAttribute('codecs');

    // find dimensions and parse to integer
    const widthAttr = rep.getAttribute('width');
    const heightAttr = rep.getAttribute('height');

    width = toInt(widthAttr);
    height = toInt(heightAttr);

    // find bandwidth and parse to integer
    const bandwidthAttr = rep.getAttribute('bandwidth');
    bandwidth = toInt(bandwidthAttr);

    // get default baseURL, if available and no override
    if (typeof override === 'string' || override instanceof String) {
      baseURL = override || "";
    }

    if (baseURL.length < 1) {
      const urlContainer = adp.querySelectorAll('BaseURL')[0];
      if (urlContainer && urlContainer.textContent) {
        baseURL = urlContainer.textContent.trim();
      }
    }

    // find segment template
    segmentTemplate = adp.querySelectorAll('SegmentTemplate')[0];
    if (!segmentTemplate || typeof segmentTemplate === 'undefined') {
      segmentTemplate = rep.querySelectorAll('SegmentTemplate')[0];
    }

    if (segmentTemplate) {
      mediaTemplate = segmentTemplate.getAttribute('media');

      initialization = segmentTemplate.getAttribute('initialization');
      initialization = initialization.replace("$RepresentationID$", id);

      const startNumAttr = segmentTemplate.getAttribute('startNumber');
      startNumber = toInt(startNumAttr);

      const timescaleAttr = segmentTemplate.getAttribute('timescale');
      timescale = toInt(timescaleAttr);

      const segDurationAttr = segmentTemplate.getAttribute('duration');
      segmentDuration = toInt(segDurationAttr);
    }

    this.id = id;
    this.mimeType = mimeType;
    this.codecs = codecs;
    this.width = width;
    this.height = height;
    this.bandwidth = bandwidth;
    this.baseURL = baseURL;
    this.mediaTemplate = mediaTemplate;
    this.initialization = initialization;
    this.startNumber = startNumber;
    this.timescale = timescale;
    this.segmentDuration = segmentDuration;
  }

  weight() {
    let weight = 0;

    if (this.width && this.height) {
      weight += this.width + this.height;
    } else if (this.bandwidth) {
      weight += this.bandwidth;
    }

    return weight;
  }
}

class Adp {
  constructor(adp, i, override) {
    let maxWidth, maxHeight;

    const maxWidthAttr = adp.getAttribute('maxWidth');
    const maxHeightAttr = adp.getAttribute('maxHeight');

    this.adp = adp;
    this.maxWidth = toInt(maxWidthAttr);
    this.maxHeight = toInt(maxHeightAttr);
    this.reps = this.reps_(adp, override);
  }

  reps_(adp, override) {
    const representations = adp.querySelectorAll("Representation");

    if (representations && representations.length > 0) {
      const reps = [];

      for (let i = 0; i != representations.length; i++) {
        const rep = representations[i];

        reps.push(new Rep(adp, rep, override));
      }

      return reps;
    } else {
      throw(`No representations present in adaptation[${i}]`);
    }
  }

  // TODO: consolidate shared code with the following 3 methods
  bestRep() {
    let weight = 0;
    let heaviestRep = 0;

    if (this.reps.length < 1) {
      return null;
    } else if (this.reps.length === 1) {
      return 0;
    }

    for (let i = 0; i < this.reps.length; i++) {
      const rep = this.reps[i];

      let currentWeight = rep.weight();

      if (currentWeight > weight) {
        weight = currentWeight;
        heaviestRep = i;
      }
    }

    return heaviestRep;
  }

  // TODO: consolidate shared code with the following method
  strongerRep(repID) {
    assert(repID !== null && typeof repID !== 'undefined',
           `rep "${repID}" invalid in strongerRep before targeting`);

    let rep;

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) { rep = this.reps[i]; break; }
    }

    assert(rep !== null && typeof rep !== 'undefined',
           `rep "${rep.id}" invalid in strongerRep after targeting`);

    let currentRep;
    let currentWeight = rep.weight();

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) {
        currentRep = this.reps[i];
        continue;
      }

      const weight = this.reps[i].weight();
      if (weight > currentWeight) { return this.reps[i]; }
    }

    return currentRep;
  }

  weakerRep(repID) {
    assert(repID !== null && typeof repID !== 'undefined',
           `rep "${repID}" invalid in weakerRep before targeting`);

    let rep;

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) { rep = this.reps[i]; break; }
    }

    assert(rep !== null && typeof rep !== 'undefined',
           `rep "${rep.id}" invalid in weakerRep after targeting`);

    let currentRep;
    let currentWeight = rep.weight();

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) {
        currentRep = this.reps[i];
        continue;
      }

      const weight = this.reps[i].weight();
      if (weight < currentWeight) { return this.reps[i]; }
    }

    return currentRep;
  }

  worstRep() {
    let weight = 0;
    let lightestRep = 0;

    if (this.reps.length < 1) {
      return null;
    } else if (this.reps.length === 1) {
      return 0;
    }

    for (let i = 0; i < this.reps.length; i++) {
      const rep = this.reps[i];

      let currentWeight = rep.weight();

      if (weight < 1 || currentWeight < weight) {
        weight = currentWeight;
        lightestRep = i;
      }
    }

    return lightestRep;
  }
}

class MPD extends Hooker {
  constructor(config = {}) {
    super();

    const kDefaultConfig = {
      url: "",
      base: "",
    };

    this.config = mergeDicts(config, kDefaultConfig);
  }

  setup() {
    return new Promise((resolve, reject) => {
      this.fetch_(this.config.url).then((result) => {
        this.parse_(result);
        resolve();
      });
    });
  }

  fetch_(url = '') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest;

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          if (!xhr.response || xhr.response.trim().length < 1) {
            reject("Attempt to fetch MPD failed");
          }

          console.log(xhr.response);
          resolve(xhr.response);
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

    this.adps = this.adps_(this.mpd, this.baseURL);
    this.duration = this.duration_(this.mpd);
    this.muxed = this.muxed_(this.mpd);
    this.type = this.type_(this.mpd);
    this.updatePeriod = this.updatePeriod_(this.mpd);

    assert(this.adps !== null && typeof this.adps !== 'undefined');
    assert(typeof this.baseURL !== 'undefined');
    assert(this.duration !== null && typeof this.duration !== 'undefined');
    assert(this.muxed !== null && typeof this.muxed !== 'undefined');
    assert(this.type !== null && typeof this.type !== 'undefined');

    assert(typeof this.updatePeriod !== 'undefined');
  }

  // source adaptations and populate with critical data and metadata
  // mpd === parsed MPD XML
  adps_(mpd, override) {
    const period = mpd.querySelectorAll("Period")[0];
    const adaptations = period.querySelectorAll("AdaptationSet");

    if (adaptations && adaptations.length > 0) {
      const adps = [];

      for (let i = 0; i != adaptations.length; i++) {
        const adaptation = adaptations[i];
        adps.push(new Adp(adaptation, i, override));
      }

      return adps;
    } else {
      throw("No AdaptationSet present in manifest.");
    }
  }

  // gets MPD-level base URL
  // mpd === parsed MPD XML
  baseURL_(mpd, override) {
    if (typeof override === 'string' || override instanceof String) {
      if (override.length > 0) {
        return override;
      }
    }

    let url = mpd.querySelectorAll("MPD BaseURL")[0];
    url = url && url.textContent ? url.textContent.trim() : '/';
    url += url.charAt(url.length - 1) !== '/' ? '/' : '';

    return url;
  }

  // acquires overall duration, if possible (VoD)
  // mpd === parsed MPD XML
  duration_(mpd) {
    const root = mpd.querySelectorAll("MPD")[0];

    if (root !== null && typeof root !== 'undefined') {
      const durationAttr = root.getAttribute("mediaPresentationDuration");

      if (durationAttr !== null && typeof durationAttr !== 'undefined') {
        if (durationAttr.length < 1) { return null; }
      }

      return toDuration(durationAttr);
    } else {
      throw("MPD is invalid; unable to source overall duration.");
    }
  }

  // samples a representations codecs
  // if both avc1 and mp4a codecs detected in same rep, true is returned
  // mpd === parsed MPD XML
  muxed_(mpd) {
    const rep = mpd.querySelectorAll("Representation")[0];

    if (rep && typeof rep !== 'undefined') {
      const codecs = rep.getAttribute('codecs');
      if (codecs.includes(',')) {
        let vid = false, aud = false, vID = "avc", aID = "mp4";

        const s = codecs.split(",");

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
    const root = mpd.querySelectorAll("MPD")[0];

    if (root && typeof root !== 'undefined') {
      let type = root.getAttribute('type');

      if (!type || type.trim() === '') { return null; }
      return type.trim();
    } else {
      throw("MPD is invalid; unable to source type.");
    }
  }

  // acquires MPD update period, if possible (live)
  //) mpd === parsed MPD XML
  updatePeriod_(mpd) {
    const root = mpd.querySelectorAll("MPD")[0];
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

    if (!hasDOM || !mpd.querySelectorAll("Period")[0]) {
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
