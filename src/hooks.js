import jr from "./jr";

class Hooks {
  constructor(hooks) {
    this.hooks = hooks || {};
  }

  run(name, ...data) {
    // fire and forget; who cares if it sticks
    return new Promise(() => {
      const hook = this.hooks[name];
      if (jr.def(hook) && jr.fnc(hook)) {
        hook(...data);
      }
    });
  }
}

export default Hooks;
