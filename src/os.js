// Holds the browser's navigator object
var N_ = navigator,

// Holds the browser's userAgent and oscpu strings for querying
U_ = (N_.userAgent + ' ' + N_.oscpu),

// is takes an OS/browser string (e.g. Mac/IE), returning validity (bool)
is = (a, b, r) => {
  b = (b || U_).toLowerCase();
  switch (a = a.toLowerCase()) {
    case 'opera':
      r = /opera|opr\//.test(b);
      break;
    case 'safari':
      r = /^((?!chrome).)*safari/.test(b);
      break;
    case 'ie':
      r = b.indexOf('trident') > -1;
      break;
    default:
      r = b.indexOf(a.toLowerCase()) > -1;
  }

  return r;
};

export default { is }
