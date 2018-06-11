import { assert } from './assert';

// convers an array buffer to Base64
// dervived from : https://stackoverflow.com/a/9458996/4043446
function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;

  for (var i = 0; i < len; i++) { binary+=String.fromCharCode(bytes[i]); }

  return btoa(binary);
}

// parses a string to an int, only if possible
function toInt(i) {
  const remainder = (i % 1);
  const forcedInt = parseInt(i);

  if(remainder === 0 && !isNaN(forcedInt)) {
    return forcedInt;
  } else if (isNaN(remainder)) {
    return null;
  } else if (i && typeof i !== 'undefined' && i != '') {
    return forcedInt;
  }

  return null;
}

// converts a ms value to a timestamp (e.g. – 300000 === 5:00)
function msToStamp(ms) {
  // ms cannot be negative
  assert(ms >= 0);

  // initialize
  const sInHour = 3600;
  const sInMinute = 60;

  let result = '';
  let working = Math.floor(ms / 1000) * 1000 / 1000;
  let hours = 0, minutes = 0, seconds = 0;

  // consume working ms
  while (working >= sInHour) { working -= sInHour; hours++; }
  while (working >= sInMinute) { working -= sInMinute; minutes++; }
  seconds = working;

  // assemble as a timestamp
  if (hours > 0) { result += `${hours}:`; }
  return result + `${minutes}:` + `${seconds.toFixed(0)}`.padStart(2, '0');
}

// parses an MPD-formatted duration
function toDuration(d) {
  assert(d !== null && typeof d !== 'undefined');
  assert(d.length > 0);

  let result = 0, duration = d, hours, minutes, seconds;

  if (duration.length >= 2) {
    let sub = duration.substring(0, 2).toUpperCase();

    if (sub === "PT") {
      duration = duration.substring(2, duration.length);
    } else if ((sub[0]==='P'||sub[0]==='T') && !isNaN(parseInt(sub[1]))) {
      duration = duration.substring(1, duration.length);
    }
  } else {
    return result;
  }

  if (duration.includes('H')) {
    duration = duration.toUpperCase().split('H');
    hours = duration.length > 1 ? parseInt(duration[0]) : 0;
    duration = duration[1] || duration + '';
  }

  if (duration.includes('M')) {
    duration = duration.toUpperCase().split('M');
    minutes = duration.length > 1 ? parseInt(duration[0]) : 0;
    duration = duration[1] || duration + '';
  }

  if (duration.includes('S')) {
    duration = duration.toUpperCase().split('S');
    seconds = duration.length > 1 ? parseFloat(duration[0]) : 0;
  }

  if (hours!==null && typeof hours!=='undefined' && !isNaN(hours)) {
    result += 3600 * hours;
  }

  if (minutes!==null && typeof minutes!=='undefined' && !isNaN(minutes)) {
    result += 60 * minutes;
  }

  if (seconds!==null && typeof seconds!=='undefined' && !isNaN(seconds)) {
    result += seconds;
  }

  return result * 1000;
}

export {
  toInt,
  msToStamp,
  toDuration,
  arrayBufferToBase64,
};
