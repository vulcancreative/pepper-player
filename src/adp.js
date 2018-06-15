import jr from './jr';
import Rep from './rep';
import { toInt } from './convert';

class Adp {
  constructor(adp, i, url, override) {
    const maxWidthAttr = jr.a('maxWidth', adp);
    const maxHeightAttr = jr.a('maxHeight', adp);

    this.adp = adp;
    this.index = i;
    this.maxWidth = toInt(maxWidthAttr);
    this.maxHeight = toInt(maxHeightAttr);
    this.reps = this.reps_(adp, url, override);
  }

  reps_(adp, url, override) {
    const representations = jr.q('Representation', adp);

    if (representations && representations.length > 0) {
      let reps = [];

      for (let i = 0; i != representations.length; i++) {
        const rep = representations[i];

        reps.push(new Rep(adp, rep, url, override));
      }

      // ensure all elements have bandwidth
      const bandwidths = reps.map(r => {
        if (r.bandwidth === null || typeof r.bandwidth === 'undefined') {
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
  bestRep() {
    return this.reps.length - 1;
  }

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
}

export default Adp;
