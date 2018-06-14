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
  randInt,
  isInt,
};
