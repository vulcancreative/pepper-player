import { os } from './os';
import { kStreamType } from './constants';

const mimeType = "application/vnd.apple.mpegURL";

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

const repToM3U8 = (mpd, r) => {
  const len = r.segmentLength();
  const count = Math.ceil(mpd.duration / len);
  const segments = Array(count).fill().map((s, i) =>
    `#EXTINF:${parseFloat(len / 1000).toFixed(5)},\n${r.mediaURL(i + 1)}`
  );

  const m3u8 = `#EXTM3U\n` +
  `#EXT-X-TARGETDURATION:1\n` +
  `#EXT-X-VERSION:7\n` +
  `#EXT-X-MEDIA-SEQUENCE:1\n` +
  `#EXT-X-PLAYLIST-TYPE:VOD\n` +
  `#EXT-X-INDEPENDENT-SEGMENTS\n` +
  `#EXT-X-MAP:URI="${r.initURL()}"\n` +
  segments.join('\n') + '\n' +
  `#EXT-X-ENDLIST`

  const blob = new Blob([m3u8], { type: mimeType });
  return URL.createObjectURL(blob);
}

// converts a valid, parsed MPD manifest to a valid HLS manifest
const mpdToM3U8 = (state) => {
  const reps = [].concat(...state.mpd.adps.map(a => a.reps));

  const audio = reps.filter(r => r.type === kStreamType.audio);
  const video = reps.filter(r => r.type === kStreamType.video);

  const audioData = audio.map(r => {
    const hlsRepURL = repToM3U8(state.mpd, r);

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
    const hlsRepURL = repToM3U8(state.mpd, r);

    return (
      `#EXT-X-STREAM-INF:` +
      `BANDWIDTH=${r.bandwidth},` +
      `CODECS="${r.codecs},${audio[0].codecs}",` +
      `RESOLUTION=${r.width}x${r.height},` +
      `AUDIO="${audio[0].id}"\n` +
      `${hlsRepURL}`
    );
  });

  console.log(audioData);
  console.log(videoData);

  const result = "#EXTM3U\n" +
  "#EXT-X-VERSION:6\n" +
  "#EXT-X-INDEPENDENT-SEGMENTS\n" +
  audioData.join('\n') + '\n' +
  videoData.join('\n');

  const blob = new Blob([result], { type: mimeType });
  return URL.createObjectURL(blob);
}

export {
  hlsSupported,
  hlsPreferred,
  mpdToM3U8,
  repToM3U8,
}
