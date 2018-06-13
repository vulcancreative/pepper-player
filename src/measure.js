function kbps(bytes, delta) {
  const bitsLoaded = bytes * 8;
  const speedBps = (bitsLoaded / delta).toFixed(2);
  const speedKbps = (speedBps / 1024).toFixed(2);

  return parseFloat(speedKbps);
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

export { kbps, speedFactor };
