// allows for custom hooks
class Hooker {
  constructor() {
    this.callbacks_ = {};
  }

  on(cb, ...events) {
    for (let i = 0; i < events.length; i++) {
      let event = events[i];

      // TODO: finish
      if (!this.callbacks_[event]) { this.callbacks_[event] == []; }

      let found = false;
      let list = this.callbacks_[event];

      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item === cb) { found = true; break; }
      }

      if (!found) { this.callbacks_[event].push(cb); }
    }
  }

  trigger(event, data) {
    this.dispatch(event, data);
    return this;
  }

  dispatch(event, data) {
    chain = this.callbacks_[event];

    if (chain) {
      for (let i = 0; i < chain.length; i++) {
        let callback = chain[i];
        callback(data);
      }
    }
  }
}

export { Hooker };
