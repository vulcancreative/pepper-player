import { expect } from 'chai';

import {
  sizeDict,
  mergeDicts,
  randStr,
  randInt,
} from './helpers';

describe('sizeDict', () => {
  it('should compare dictionary sizes', () => {
    let dictOne = {
      a: 1,
      b: 2,
    };

    let dictTwo = {
      alpha: 1,
      beta: "string",
      gamma: [
        2,
        "array",
        "of",
        {
          "strings": "",
        }
      ],
    };

    expect(sizeDict(dictOne)).to.equal(2);
    expect(sizeDict(dictTwo)).to.equal(3);
  });
});

describe('mergeDicts', () => {
  it('should fill in blank strings in an object', () => {
    let defaultObj = {
      a: "alpha",
      b: "beta",
      c: null,
    };

    let baseObj = {
      a: null,
      b: "override",
      c: "gamma",
    };

    const merge = mergeDicts(baseObj, defaultObj);

    expect(merge.a).to.equal("alpha");
    expect(merge.b).to.equal("override");
    expect(merge.c).to.equal("gamma");
  });

  it('should fill in blank integers in an object', () => {
    let defaultObj = {
      one: 1,
      two: null,
      three: 3,
    };

    let baseObj = {
      one: 3,
      two: 2,
      three: null,
    };

    const merge = mergeDicts(baseObj, defaultObj);

    expect(merge.one).to.equal(3);
    expect(merge.two).to.equal(2);
    expect(merge.three).to.equal(3);
  });
});

describe('randStr', () => {
  const strOne = randStr(10),
        strTwo = randStr(10),
        strThree = randStr(25),
        strFour = randStr(25);

  it('should produce strings of deterministic length', () => {
    expect(strOne.length).to.equal(strTwo.length);
    expect(strThree.length).to.equal(strFour.length);

    expect(strOne.length).to.not.equal(strThree.length);
    expect(strOne.length).to.not.equal(strFour.length);
    expect(strTwo.length).to.not.equal(strThree.length);
    expect(strTwo.length).to.not.equal(strFour.length);
  });

  it('should produce sufficiently random output', () => {
    expect(strOne).to.not.equal(strTwo);
    expect(strOne).to.not.equal(strThree);
    expect(strOne).to.not.equal(strFour);
    expect(strTwo).to.not.equal(strThree);
    expect(strTwo).to.not.equal(strFour);
    expect(strThree).to.not.equal(strFour);
  })
});

describe('randInt', () => {
  const intOne = randInt(10, 35),
        intTwo = randInt(86, 114),
        intThree = randInt(3, 7),
        intFour = randInt(97, 101);

  it('should produce integers only within the provided range', () => {
    expect(intOne >= 10 && intOne <= 35);
    expect(intTwo >= 86 && intTwo <= 114);
    expect(intThree >= 3 && intThree <= 7);
    expect(intFour >= 97 && intFour <= 101);
  });

  it('should produce sufficiently random output', () => {
    expect(intOne).to.not.equal(intTwo);
    expect(intOne).to.not.equal(intThree);
    expect(intOne).to.not.equal(intFour);
    expect(intTwo).to.not.equal(intThree);
    expect(intTwo).to.not.equal(intFour);
    expect(intThree).to.not.equal(intFour);
  });
});
