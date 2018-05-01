var strings = {}; strings = (function() {
  // pads a string up to a certain number of characters with a passed
  // character. If no passed character is received, 0 is used.
  var pad = function(a, b, c, r) {
    if ((a + '').length > b) { return '???' }

    b = b ? b : 1;
    return a < 10 && b == 2 ? '0' + a :
    (b > 2 ? Array(b - (a+'').length).join(0) + a : '' + a)
  };

  // very simple URL detection
  //
  // the following strings should return true:
  // "http://test1.vulcanca.com/bbb.mpd"
  // "https://aws.aslfkjsdkfjdsfb.vn/aslkdfjsklfjdlkjf.mp4"
  // "/penis"
  //
  // the following strings should return false:
  // "blahblahblah"
  // "hwa"
  var isURL = function(s) {
    var p = /^(((http|https):\/+)|\/).*\.?.*(\/.*)?/
    return p.test(s);
  }

  // simple cents to USD conversion
  //
  // c is an unsigned integer representing cents
  // z is an optional string to return if c == 0; otherwise returns "0"
  var toUSD = function(c, z) {
    c = parseInt(c),
    c = isNaN(c) ? 0 : c,
    c = c < 0 ? 0 : c,
    z = (z || '') + '';

    // if c is 0 and z is valid, return z...
    return c == 0 && z.length > 0 ? z : (

      // ...else, if c is 0, return "0"...
      c == 0 ? '0' :

      // ...else, convert
      '$' + (parseFloat(c) / 100.0).toFixed(2)
    )
  }

  return {
    pad:  pad,
    isURL: isURL,
    toUSD: toUSD,
  }
})();

export { strings };
