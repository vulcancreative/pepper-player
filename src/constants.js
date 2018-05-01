const kProtocol = {
  hls: 'HLS',
  dash: 'DASH',
};

const kStreamType = {
  audio: 'audio',
  video: 'video',
  muxed: 'muxed',
};

const kSegmentType = {
  init: 'initialization',
  segment: 'segment',
};

const kTransitions = {
  countdown: 'countdown',
  immedaite: 'immediate',
};

const kBackingType = {
  splitX: 'splitX',
  splitY: 'splitY',
  uniform: 'uniform',
};

export {
  kProtocol,
  kStreamType,
  kSegmentType,
  kTransitions,
  kBackingType,
};
