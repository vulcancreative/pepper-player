import { toInt } from './convert';
import { kStreamType } from './constants';

class Rep {
  constructor(adp, rep, url, override) {
    let id, codecs, width, height, bandwidth, baseURL,
    initialization, mediaTemplate, segmentTimeline, segmentTemplate,
    timelineParts, startNumber, timescale, mimeType,
    segmentDuration, type, tileInfo;

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

    const baseURLFallback = () => {
      const srcParts = url.split('/');
      const srcLen = srcParts.length;

      baseURL = srcLen > 1 ? srcParts.slice(0,srcLen-1).join('/') : '/';
      baseURL += baseURL.charAt(baseURL.length - 1) === '/' ? '' : '/';
    };

    if (baseURL && baseURL.length < 1) {
      const urlContainer = adp.querySelectorAll('BaseURL')[0];
      if (urlContainer && urlContainer.textContent) {
        baseURL = urlContainer.textContent.trim();
      } else {
        baseURLFallback();
      }
    } else {
      baseURLFallback();
    }

    segmentTimeline = adp.querySelectorAll('SegmentTimeline')[0];
    if (segmentTimeline!==null && typeof segmentTimeline!=='undefined') {
      timelineParts = [...segmentTimeline.children];
    }

    // find segment template
    segmentTemplate = adp.querySelectorAll('SegmentTemplate')[0];
    if (!segmentTemplate || typeof segmentTemplate === 'undefined') {
      segmentTemplate = rep.querySelectorAll('SegmentTemplate')[0];
    }

    if (segmentTemplate) {
      mediaTemplate = segmentTemplate.getAttribute('media');

      initialization = segmentTemplate.getAttribute('initialization');

      if (initialization!==null && typeof initialization!=='undefined') {
        initialization = initialization.replace("$RepresentationID$", id);
      }

      const startNumAttr = segmentTemplate.getAttribute('startNumber');
      startNumber = toInt(startNumAttr);

      const timescaleAttr = segmentTemplate.getAttribute('timescale');
      timescale = toInt(timescaleAttr);

      const segDurationAttr = segmentTemplate.getAttribute('duration');
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

      const durationAttr = segmentTemplate.getAttribute('duration');
      const essential = rep.querySelectorAll('EssentialProperty')[0];

      if (essential !== null && typeof essential !== 'undefined') {
        dimensionAttr = essential.getAttribute('value');
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
    this.timeline = timelineParts;
    this.mediaTemplate = mediaTemplate;
    this.initialization = initialization;
    this.startNumber = startNumber;
    this.timescale = timescale;
    this.segmentDuration = segmentDuration;
    this.tileInfo = tileInfo;
    this.type = type;
  }

  weight() {
    let weight = 0;

    if (this.width && this.height) {
      weight += this.width + this.height + this.bandwidth;
    } else if (this.bandwidth) {
      weight += this.bandwidth;
    }

    return weight < -1 ? 0 : weight;
  }
}

export default Rep;
