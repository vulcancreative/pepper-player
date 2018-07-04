import { os } from './os';
// import clock from './clock';
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

  return true;
}

// TODO: group like-code in this function
const hlsMakePoints = (state, r, len) => {
  const mpd = state.mpd;

  // const now = clock.now();
  // const [points] = r.makePoints(state.mpd, 0, null, now, 0);
  // console.log(points);
  const base = mpd.type === 'dynamic' ?
    r.timeline.slice(0, 10) :
    Array(Math.ceil(mpd.duration / len)).fill();

  return base.map((s, i) =>
    `#EXTINF:${parseFloat(len / 1000).toFixed(5)},
    ${r.mediaURL(mpd.type === 'dynamic' ? s : i + 1)}`
  );
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
