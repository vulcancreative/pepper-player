// counts items in a dictionary and returns the size
function sizeDict(d) {
  return Object.keys(d).length;
}

// merges two dictionaries, with the first one taking priority
function mergeDicts(a, b) {
  let result = {};
  for (let k of Object.keys(b)) {
    result[k] = (a[k]!==null && typeof a[k]!=='undefined') ? a[k] : b[k];
  }

  return result;
}

// generates a random alpha-numeric string of "len" length
function randStr(len = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "abcdefghijklmnopqrstuvwxyz0123456789";

  let result = [];

  for (let i = 0; i < len; i++) {
    result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }

  return result.join("");
}

// generates a random integer between a provided range
function randInt(min, max) {
  return parseInt(Math.floor(Math.random() * (max - min + 1) + min));
}

// checks whether a variable is an integer or not
function isInt(value) {
  if (isNaN(value)) { return false; }
  var x = parseFloat(value);
  return (x | 0) === x;
}

export {
  sizeDict,
  mergeDicts,
  randStr,
  randInt,
  isInt,
};
