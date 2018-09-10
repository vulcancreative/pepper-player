// shortcut for null
var N_ = null,

// shortcut for 'undefined'
U_ = 'undefined',

// def is a shortcut for checking if something is defined
def = (a => a !== N_ && typeof a !== U_),

// ndef is a shortcut for checking if something is undefined
ndef = (a => !def(a)),

// denotes whether something is a function or not
fnc = (a) => def(a) && typeof a.call === 'function',

// a aliases getAttribute; b is a node.
a = ((a, b) => b.getAttribute(a)),

// q aliases querySelectorAll; b is an optional node
q = (a, b) => {

  // Uses the default query function if possible, or improvises
  var q = (a, b) => {

    // Perform a general query on root node
    b = [].slice.call(b.querySelectorAll(a));

    // Return resulting value(s)
    return b
  }

  // Returns the query function's result(s)
  return q(a, b)
};

export default { def, ndef, fnc, a, q }
