// convers an array buffer to Base64
// dervived from : https://stackoverflow.com/a/9458996/4043446
const arrayBufferToBase64 = (buffer) => {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;

  for (var i = 0; i < len; i++) { binary+=String.fromCharCode(bytes[i]); }

  return btoa(binary);
};

// parses a string to an int, only if possible
const toInt = (i) => {
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
};

// converts a ms value to a timestamp (e.g. – 300000 === 5:00)
const msToStamp = (ms) => {
  // initialize
  const sInHour = 3600000;
  const sInMinute = 60000;

  let result = '';
  let working = Math.floor(ms > -1 ? ms : 0 / 1000) * 1000 / 1000;
  let hours = 0, minutes = 0, seconds = 0;

  // consume working ms
  while (working >= sInHour) { working -= sInHour; hours++; }
  while (working >= sInMinute) { working -= sInMinute; minutes++; }
  seconds = working / 1000;

  // assemble as a timestamp
  if (hours > 0) { result += `${hours}:`; }
  return result +
         (
           hours > 0 ?
           `${minutes.toFixed(0)}`.padStart(2, '0') : 
           `${minutes}`
         ) + ':' +
         `${seconds.toFixed(0)}`.padStart(2, '0');
};

// parses an MPD-formatted duration
const toDuration = (d) => {
  const durationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;

  const matches = d.match(durationRegex);
  const multipliers = [
    0, // global match
    0, // sign (+/-) match
    31536000000, // year
    2540160000, // month (~4.2 weeks)
    604800000, // week
    86400000, // day
    3600000, // hour
    60000, // minute
    1000, // second
  ];

  return matches.reduce((a, c, i) => {
    if (i < 2) { return 0; }
    if (c === null || typeof c === 'undefined') { return a + 0; }
    return a + c * multipliers[i];
  });
};

export {
  toInt,
  msToStamp,
  toDuration,
  arrayBufferToBase64,
};
