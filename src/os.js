var os = {}; os = (function() {

  var N_, U_;

  if (navigator !== null && typeof navigator !== 'undefined') {
    // Holds the browser's navigator object.
    N_ = navigator,

    // Holds the browser's userAgent and oscpu strings for querying.
    U_ = (N_.userAgent + ' ' + N_.oscpu).toLowerCase();
  }


  // is takes an OS/browser string (Mac/IE), returning validity (bool).
  var is = function(a, b) {
    if (navigator === null || typeof navigator === 'undefined') {
      return false;
    }

    b = /bot|spider|crawl|seeker/;

    // Cycle through possible checks.
    switch(a = a.toLowerCase()) {

      // Chrome is based on WebKit, so check Safari first.
      case "safari" :
        return /^((?!chrome).)*safari/.test(U_);

      // See if userAgent/oscpu or bot whitelist contain request a.
      default:
        return ~U_.search(a) || b.test(U_);
    }
  };

  return {
    is: is,
  }
})();

export { os };
