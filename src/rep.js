import jr from './jr';
import { toInt } from './convert';
import { kStreamType } from './constants';

class Rep {
  constructor(adp, rep, url, override, startTime) {
    this.presentationTime = startTime;

    let id, codecs, width, height, bandwidth, baseURL,
    initialization, mediaTemplate, segmentTimeline, segmentTemplate,
    timeline, timelineParts, startNumber, timescale, mimeType,
    segmentDuration, type, tileInfo;

    // source id from rep attribute
    id = jr.a('id', rep);

    // mimeType can be on either the adp or the rep
    mimeType = jr.a('mimeType', adp);
    if (jr.ndef(mimeType)) {
      mimeType = jr.a('mimeType', rep);
    }

    // source codecs from rep attribute
    codecs = jr.a('codecs', rep);

    // find dimensions and parse to integer
    const widthAttr = jr.a('width', rep);
    const heightAttr = jr.a('height', rep);

    width = toInt(widthAttr) || 0;
    height = toInt(heightAttr) || 0;

    // find bandwidth and parse to integer
    const bandwidthAttr = jr.a('bandwidth', rep);
    bandwidth = toInt(bandwidthAttr);

    // get default baseURL, if available and no override
    baseURL = override || "";

    const srcParts = url.split('/');
    const srcLen = srcParts.length;

    baseURL = srcLen > 1 ? srcParts.slice(0,srcLen-1).join('/') : '/';
    baseURL += baseURL.charAt(baseURL.length - 1) === '/' ? '' : '/';

    segmentTimeline = jr.q('SegmentTimeline', adp)[0];
    if (jr.def(segmentTimeline)) {
      const pieces = [...segmentTimeline.children];
      timelineParts = pieces;
      timeline = this.timeline_(pieces);
    }

    // find segment template
    segmentTemplate = jr.q('SegmentTemplate', adp)[0];
    if (!segmentTemplate) {
      segmentTemplate = jr.q('SegmentTemplate', rep)[0];
    }

    if (segmentTemplate) {
      mediaTemplate = jr.a('media', segmentTemplate);

      initialization = jr.a('initialization', segmentTemplate);

      if (jr.def(initialization)) {
        initialization = initialization.replace("$RepresentationID$", id);
      }

      const startNumAttr = jr.a('startNumber', segmentTemplate);
      startNumber = toInt(startNumAttr);

      const timescaleAttr = jr.a('timescale', segmentTemplate);
      timescale = toInt(timescaleAttr);

      const segDurationAttr = jr.a('duration', segmentTemplate);
      segmentDuration = toInt(segDurationAttr);
    }

    if (mimeType && mimeType.includes('video') && width && height) {
      type = kStreamType.video;
    } else if (mimeType && mimeType.includes('audio') && bandwidth) {
      type = kStreamType.audio;
    } else if (mimeType && mimeType.includes('image')) {
      type = kStreamType.image;
    }

    if (type === kStreamType.image) {
      let dimensionAttr = '1x1';

      const durationAttr = jr.a('duration', segmentTemplate);
      const essential = jr.q('EssentialProperty', rep)[0];

      if (essential) {
        dimensionAttr = jr.a('value', essential);
      }

      tileInfo = {
        duration: parseInt(durationAttr) * 1000,
        count: parseInt(dimensionAttr.split('x')[0]),
        width: width,
        height: height,
      };
    }

    this.id = id;
    this.mimeType = mimeType;
    this.codecs = codecs;
    this.width = width;
    this.height = height;
    this.bandwidth = bandwidth;
    this.baseURL = baseURL;
    this.timelineParts = timelineParts;
    this.timeline = timeline;
    this.mediaTemplate = mediaTemplate;
    this.initialization = initialization;
    this.startNumber = startNumber;
    this.timescale = timescale;
    this.segmentDuration = segmentDuration;
    this.tileInfo = tileInfo;
    this.type = type;
  }

  initURL() {
    const initName = this.initialization;
    const baseURL = this.baseURL;

    let initURL = baseURL ? `${baseURL}${initName}` : initName;
    return initURL.replace(/\$RepresentationID\$/g, `${this.id}`);
  }

  makePoints(mpd, current, target, now, last = 0) {
    if (jr.def(this.timeline)) {
      return this.makeTimelinePoints(last);
    }

    return [this.makeTemplatePoints(mpd, current, target, now), null];
  }

  makeTimelinePoints(last) {
    let pos = 0, current = last, result;

    while (current <= last) {
      result = this.timeline[pos];
      current = result;
      pos++;
    }

    console.log(`${last}, ${result}`);
    if (last === result) { throw("last === result") }

    return [[result], result];
  }

  makeTemplatePoints(mpd, current, target, now) {
    const len = this.segmentLength();

    if (mpd.type === 'static') {
      if (this.type === kStreamType.image && this.tileInfo !== null) {
        const count = Math.ceil(mpd.duration / this.tileInfo.duration);
        return (new Array(count)).fill(0).map((s, i) => i + 1);
      }

      const delta = (target < current ? current+1000 : target)-current;
      const steps = parseInt(
        Math.ceil(parseFloat(delta) / parseFloat(len))
      );

      const last = parseInt(
        Math.ceil(parseFloat(current) / parseFloat(len))
      );

      return (new Array(steps).fill(last).map((v, i) => v + (i + 1)));
    } else if (mpd.type === 'dynamic') {
      const delta = Math.abs(now - mpd.startTime);

      if (target && target > now) {
        return Array(1 + ((target - now) / len)).fill().map((a, i) => {
          return (delta + len * i) / len - 10;
        });
      }

      return [Math.ceil(delta / len - 10)];
    }

    throw(`Unable to decipher source type ("${mpd.type}")`);
  }

  mediaURL(next) {
    const

    //e.g "...$Time$.m4s"
    nVarT = /\$Time\$/g,

    //e.g "...$Number$.m4s"
    nVarN = /\$Number\$/g,

    //e.g "...$Number%05d$.m4s"
    nVarD = /(\$Number%(\d+)d\$)/g,

    //e.g "stream$RepresentationID$..."
    rVarN = /\$RepresentationID\$/g;

    /*
     * TODO: solidfy as trace-level debug text
    console.log(`Filling buffer for rep "${rep.id}"`);
    console.log(`Current : ${current}, target : ${target}, ` +
                `segment length : ${this.segmentLength()}, ` +
                `steps : ${steps}`);
    */

    const nStr = `${next}`;
    let mediaName = this.mediaTemplate.replace(rVarN, `${this.id}`);

    if (nVarT.test(mediaName) && this.timeline.length > 0) {
      mediaName = mediaName.replace(nVarT, nStr);
    } else if (nVarD.test(mediaName)) {
      const nVarDC = /(\$Number%(\d+)d\$)/g;

      const matches = nVarDC.exec(mediaName);
      const amount = parseInt(matches[matches.length - 1]) + 1;
      const segmentNumberExt = nStr.padStart(amount - 1, '0');

      mediaName = mediaName.replace(matches[0], segmentNumberExt);
      mediaName = mediaName.replace(nVarN, nStr);
    } else {
      mediaName = mediaName.replace(nVarN, nStr);
    }

    const baseURL = this.baseURL;
    return baseURL ? `${baseURL}${mediaName}` : mediaName;
  }

  segmentLength() {
    // average size if timeline-based
    if (this.timelineParts && this.timelineParts.length > 0) {
      const points = [];

      for (let i = 0; i < this.timelineParts.length; i++) {
        const point = this.timelineParts[i];
        const scale = this.timescale;
        const d = parseInt(point.getAttribute('d'));
        
        points.push(d / scale);
      }

      if (points.length > 0) {
        const sum = points.reduce((a, c) => a + c);
        return sum / points.length * 1000;
      }
    }

    // direct size if template-based
    const timescale = parseFloat(this.timescale);
    const duration = parseFloat(this.segmentDuration);

    if ((timescale===null && typeof timescale==='undefined') ||
         isNaN(timescale)) { return duration * 1000; }

    const ticks = Math.floor(duration / timescale);
    const size = parseInt(ticks) * 1000;

    return size;
  }

  weight() {
    return this.width + this.height + this.bandwidth;
  }

  timeline_(points) {
    let timeline = [];
    let lastTime = 0;

    for (let i = 0; i != points.length; i++) {
      const point = points[i];

      let t = parseInt(jr.a('t', point));
      let d = parseInt(jr.a('d', point));
      let r = parseInt(jr.a('r', point));

      // normalize t
      t -= this.presentationTime;

      // normalize r
      r = isNaN(r) || r < 1 ? 1 : r;

      let startTime = jr.def(t) && !isNaN(t) ? t : lastTime;

      for (let j = 0; j != r; j++) {
        let endTime = startTime + d;
        timeline.push(endTime);

        lastTime = endTime;
      }
    }

    return timeline;
  }
}

export default Rep;
