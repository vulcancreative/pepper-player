import { assert } from './assert';

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
  toDuration,
};
