import Rep from './rep';
import { assert } from './assert';
import { toInt } from './convert';

class Adp {
  constructor(adp, i, url, override) {
    const maxWidthAttr = adp.getAttribute('maxWidth');
    const maxHeightAttr = adp.getAttribute('maxHeight');

    this.adp = adp;
    this.index = i;
    this.maxWidth = toInt(maxWidthAttr);
    this.maxHeight = toInt(maxHeightAttr);
    this.reps = this.reps_(adp, url, override);
  }

  reps_(adp, url, override) {
    const representations = adp.querySelectorAll("Representation");

    if (representations && representations.length > 0) {
      const reps = [];

      for (let i = 0; i != representations.length; i++) {
        const rep = representations[i];

        reps.push(new Rep(adp, rep, url, override));
      }

      return reps;
    } else {
      throw(`No representations present in adaptation[${this.index}]`);
    }
  }

  // TODO: consolidate shared code with the following 3 methods
  bestRep() {
    let weight = 0;
    let heaviestRep = 0;

    if (this.reps.length < 1) {
      return null;
    } else if (this.reps.length === 1) {
      return 0;
    }

    for (let i = 0; i < this.reps.length; i++) {
      const rep = this.reps[i];

      let currentWeight = rep.weight();

      if (currentWeight > weight) {
        weight = currentWeight;
        heaviestRep = i;
      }
    }

    return heaviestRep;
  }

  // TODO: consolidate shared code with the following method
  strongerRep(repID) {
    assert(repID !== null && typeof repID !== 'undefined',
           `rep "${repID}" invalid in strongerRep before targeting`);

    let rep;

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) { rep = this.reps[i]; break; }
    }

    assert(rep !== null && typeof rep !== 'undefined',
           `rep "${rep.id}" invalid in strongerRep after targeting`);

    let currentRep;
    let currentWeight = rep.weight();

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) {
        currentRep = this.reps[i];
        continue;
      }

      const weight = this.reps[i].weight();
      if (weight > currentWeight) { return this.reps[i]; }
    }

    return currentRep;
  }

  weakerRep(repID) {
    assert(repID !== null && typeof repID !== 'undefined',
           `rep "${repID}" invalid in weakerRep before targeting`);

    let rep;

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) { rep = this.reps[i]; break; }
    }

    assert(rep !== null && typeof rep !== 'undefined',
           `rep "${rep.id}" invalid in weakerRep after targeting`);

    let currentRep;
    let currentWeight = rep.weight();

    for (let i = 0; i != this.reps.length; i++) {
      if (this.reps[i].id === repID) {
        currentRep = this.reps[i];
        continue;
      }

      const weight = this.reps[i].weight();
      if (weight < currentWeight) { return this.reps[i]; }
    }

    return currentRep;
  }

  worstRep() {
    let weight = 0;
    let lightestRep = 0;

    if (this.reps.length < 1) {
      return null;
    } else if (this.reps.length === 1) {
      return 0;
    }

    for (let i = 0; i < this.reps.length; i++) {
      const rep = this.reps[i];

      let currentWeight = rep.weight();

      if (weight < 1 || currentWeight < weight) {
        weight = currentWeight;
        lightestRep = i;
      }
    }

    return lightestRep;
  }
}

export default Adp;
