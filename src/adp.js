import jr from './jr';
import Rep from './rep';
import { toInt } from './convert';

class Adp {
  constructor(adp, i, url, override, startTime) {
    const maxWidthAttr = jr.a('maxWidth', adp);
    const maxHeightAttr = jr.a('maxHeight', adp);

    this.adp = adp;
    this.index = i;
    this.maxWidth = toInt(maxWidthAttr);
    this.maxHeight = toInt(maxHeightAttr);
    this.reps = this.reps_(adp, url, override, startTime);
  }

  reps_(adp, url, override, startTime) {
    const representations = jr.q('Representation', adp);

    if (representations && representations.length > 0) {
      let reps = [];

      for (let i = 0; i != representations.length; i++) {
        const rep = representations[i];

        reps.push(new Rep(adp, rep, url, override, startTime));
      }

      // ensure all elements have bandwidth
      const bandwidths = reps.map(r => {
        if (jr.ndef(r.bandwidth)) {
          return null;
        }

        return r.bandwidth;
      });

      // if missing bandwidth, ensure even depth
      if (bandwidths.includes(null)) {
        const notNull = bandwidths.findIndex(r => r !== null);
        const bandwidth = notNull > -1 ? bandwidths[notNull] : 0;

        reps = reps.map(r => { r.bandwidth = bandwidth; return r; });
      }

      // sort by weight
      reps.sort((a, b) => {
        if (a.weight() < b.weight()) { return -1; }
        if (a.weight() > b.weight()) { return 1; }
        return 0;
      });

      return reps;
    } else {
      throw(`No representations present in adaptation[${this.index}]`);
    }
  }

  // TODO: consolidate shared code with the following 3 methods
  bestRep(speedBps) {
    if (jr.def(speedBps)) { return this.matchBandwidth(speedBps) }
    return this.reps[this.reps.length - 1];
  }

  matchBandwidth(speedBps) {
    let pos = 0, current = this.reps[pos].bandwidth;

    for (let i = 1; i < this.reps.length; i++) {
      const rep = this.reps[i];
      const bits = rep.bandwidth;

      if (Math.abs(speedBps * 0.8 - bits) < Math.abs(bits - current)) {
        pos = i;
        current = bits;
      }
    }

    return this.reps[pos];
  }

  /*
  // TODO: consolidate shared code with the following method
  strongerRep(repID) {
    let rep;
    const sortedReps = this.reps;

    for (let i = 0; i != sortedReps.length; i++) {
      if (sortedReps[i].id === repID) { rep = sortedReps[i]; break; }
    }

    let currentRep = rep;
    let currentWeight = rep.weight();

    for (let i = 0; i != sortedReps.length; i++) {
      const weight = sortedReps[i].weight();
      if (weight > currentWeight) { currentRep = sortedReps[i]; break; }
    }

    return currentRep;
  }

  weakerRep(repID) {
    let rep;
    const sortedReps = this.reps.slice().reverse();

    for (let i = 0; i != sortedReps.length; i++) {
      if (sortedReps[i].id === repID) { rep = sortedReps[i]; break; }
    }

    let currentRep = rep;
    let currentWeight = rep.weight();

    for (let i = 0; i != sortedReps.length; i++) {
      const weight = sortedReps[i].weight();
      if (weight < currentWeight) { currentRep = sortedReps[i]; break; }
    }

    return currentRep;
  }

  worstRep() {
    return 0;
  }
  */
}

export default Adp;
