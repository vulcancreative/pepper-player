function assert(comp = false, message) {
  if (!comp) {
    let suffix = "";
    if (message) { suffix = `; ${message}`; }

    throw(`Assertion error${suffix}`);
  }
};

export { assert };
