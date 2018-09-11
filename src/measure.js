const bpsHistory = [];

function clearBpsHistory() {
  while (bpsHistory.length > 0) { bpsHistory.shift() }
}

function pushBpsHistory(value) {
  const maxBpsHistory = 15;
  bpsHistory.push(value);
  while (bpsHistory.length > maxBpsHistory) { bpsHistory.shift() }
}

function bps(bytes, delta) {
  const augBytes = delta < 1 ? bytes * (1 / delta) : bytes;
  const bitsLoaded = augBytes * 8;
  const speedBps = (bitsLoaded / delta).toFixed(2);

  return parseFloat(speedBps);
}

function kbps(bytes, delta) {
  return parseFloat((bps(bytes, delta) / 1024).toFixed(2));
}

function bpsAvg() {
  if (bpsHistory.length < 1) { return 0 }
  const avg = bpsHistory.reduce((p, c) => p + c, 0) / bpsHistory.length;
  const speedBps = avg.toFixed(2);

  return parseFloat(speedBps);
}

function kbpsAvg() {
  return parseFloat((bpsAvg() / 1024).toFixed(2));
}

// take a speed (kbps), size (bytes), and a time (ms)
// returns percentage (float) of time that it would take to process size
function speedFactor(speed, size, delta) {
  const bits = size * 8;
  const speedBps = speed * 1024;
  const seconds = delta / 1000;
  const ttl = bits / speedBps;

  console.log(`ttl: ${ttl}, seconds: ${seconds}`);
  const contrast = (parseFloat(ttl) / parseFloat(seconds)).toFixed(2);

  return parseFloat(contrast);
}

export {
  bps,
  kbps,
  bpsAvg,
  kbpsAvg,
  speedFactor,
  pushBpsHistory,
  clearBpsHistory,
};
