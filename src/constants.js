const kMPDType = {
  static: "static",
  dynamic: "dynamic"
};

const kProtocol = {
  hls: "HLS",
  dash: "DASH"
};

const kStreamType = {
  audio: "audio",
  video: "video",
  muxed: "muxed",
  image: "image"
};

const kSegmentType = {
  init: "initialization",
  segment: "segment"
};

const kTransitions = {
  countdown: "countdown",
  immedaite: "immediate"
};

const kBackingType = {
  splitX: "splitX",
  splitY: "splitY",
  uniform: "uniform"
};

export {
  kMPDType,
  kProtocol,
  kStreamType,
  kSegmentType,
  kTransitions,
  kBackingType
};
