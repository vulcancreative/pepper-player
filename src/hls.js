import { os } from './os';
import { kStreamType } from './constants';

// let lastPoint;
const mimeType = "application/vnd.apple.mpegurl";

const hlsSupported = () => {
  const kHLSType = mimeType;

  let video = document.createElement('video');
  return video.canPlayType && !!video.canPlayType(kHLSType);
}

const hlsPreferred = () => {
  if (os.is('chrome')) { return false; }
  if (!hlsSupported()) { return false; }

  return false;
}

// TODO: group like-code in this function
const hlsMakePoints = (state, r, len) => {
  let result;
  const mpd = state.mpd;

  if (mpd.type === 'dynamic') {
    const now = new Date();
    const then = (new Date()).setSeconds(now.getSeconds() + 28800);
    const [points] = r.makePoints(state.mpd, now, then, r, 80);
    result = points.map(s =>
      `#EXTINF:${parseFloat(len/1000).toFixed(5)},\n${r.mediaURL(s)}`
    );
  } else {
    const count = Math.ceil(mpd.duration / len);
    result = Array(count).fill().map((s, i) =>
      `#EXTINF:${parseFloat(len/1000).toFixed(5)},\n${r.mediaURL(i+1)}`
    );
  }

  return result;
}

const repToM3U8 = (state, r) => {
  const mpd = state.mpd;

  const len = r.segmentLength();
  const points = hlsMakePoints(state, r, len);

  const m3u8 =
  `#EXTM3U\n` +
  `#EXT-X-TARGETDURATION:${parseInt(Math.ceil(len / 1000))}\n` +
  `#EXT-X-VERSION:7\n` +
  `#EXT-X-PLAYLIST-TYPE:${mpd.type === 'static' ? 'VOD' : 'EVENT'}\n` +
  `#EXT-X-INDEPENDENT-SEGMENTS\n` +
  `#EXT-X-MAP:URI="${r.initURL()}"\n` +
  points.join('\n') + '\n' +
  `${mpd.type === 'static' ? '#EXT-X-ENDLIST' : ''}`

  const blob = new Blob([m3u8], { type: mimeType });
  return URL.createObjectURL(blob);
}

// converts a valid, parsed MPD manifest to a valid HLS manifest
const mpdToM3U8 = (state) => {
  const reps = [].concat(...state.mpd.adps.map(a => a.reps));

  const audio = reps.filter(r => r.type === kStreamType.audio);
  const video = reps.filter(r => r.type === kStreamType.video);

  const audioData = audio.map(r => {
    const hlsRepURL = repToM3U8(state, r);

    return (
      `#EXT-X-MEDIA:TYPE=AUDIO,` +
      `GROUP-ID="${r.id}",` +
      `NAME="${r.id}",` +
      `LANGUAGE="en-US",` +
      `AUTOSELECT=YES,DEFAULT=YES,` +
      `CHANNELS="2",` +
      `URI="${hlsRepURL}"`
    );
  });

  const videoData = video.map(r => {
    const hlsRepURL = repToM3U8(state, r);

    return (
      `#EXT-X-STREAM-INF:` +
      `BANDWIDTH=${r.bandwidth},` +
      `CODECS="${r.codecs},${audio[0].codecs}",` +
      `RESOLUTION=${r.width}x${r.height},` +
      `AUDIO="${audio[0].id}"\n` +
      `${hlsRepURL}`
    );
  });

  console.log("state.mpd.type : " + state.mpd.type);

  const result =
  "#EXTM3U\n" +
  "#EXT-X-VERSION:6\n" +
  "#EXT-X-INDEPENDENT-SEGMENTS\n" +
  audioData.join('\n') + '\n' +
  videoData.join('\n');

  return result;
}

export {
  mimeType as hlsMimeType,
  hlsSupported,
  hlsPreferred,
  mpdToM3U8,
  repToM3U8,
}
