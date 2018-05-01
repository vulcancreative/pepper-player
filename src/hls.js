import { os } from './os';

function hlsSupported() {
  const kHLSType = "application/vnd.apple.mpegURL";

  let video = document.createElement('video');
  return video.canPlayType && !!video.canPlayType(kHLSType);
}

function hlsPreferred(config) {
  if (os.is('chrome')) { return false; }
  if (!hlsSupported()) { return false; }

  const item = config.playlist[config.index];

  if (item.hls.length && item.hls.includes('.m3u8')) || item.hls === true {
    return true;
  }

  return false;
}

// converts a valid, parsed MPD manifest to a valid HLS manifest
function mpdToM3U8(state) {
  // TODO
}

function repToM3U8(state, adpi, repi) {
  // TODO
}

export {
  hlsSupported,
  hlsPreferred,
}
