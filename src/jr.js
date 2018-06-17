// shortcut for null
var N_ = null,

// shortcut for 'undefined'
U_ = 'undefined',

// def is a shortcut for checking if something is defined.
def = (a => a !== N_ && typeof a !== U_),

// ndef is a shortcut for checking if something is undefined.
ndef = (a => a === N_ || typeof a === U_),

// a aliases getAttribute; b is a node.
a = ((a, b) => b.getAttribute(a)),

// q aliases querySelectorAll; b is an optional node.
q = (a, b) => {

  // Uses the default query function if possible, or improvises.
  var q = (a, b) => {

    // Check for b, otherwise use document as root node, instead.
    ndef(b) ? b = document : b;

    // Perform a general query on root node.
    b = [].slice.call(b.querySelectorAll(a));

    // Return resulting value(s).
    return b
  }

  // Returns the query function's result(s).
  return q(a, b)
};

export default { def, ndef, a, q }
