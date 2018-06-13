import {
  sizeDict,
  mergeDicts,
  randStr,
  randInt,
  isInt,
} from './helpers';

describe('sizeDict', () => {
  test('should compare dictionary sizes', () => {
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

    expect(sizeDict(dictOne)).toBe(2);
    expect(sizeDict(dictTwo)).toBe(3);
  });
});

describe('mergeDicts', () => {
  test('should fill in blank strings in an object', () => {
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

    expect(merge.a).toBe("alpha");
    expect(merge.b).toBe("override");
    expect(merge.c).toBe("gamma");
  });

  test('should fill in blank integers in an object', () => {
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

    expect(merge.one).toBe(3);
    expect(merge.two).toBe(2);
    expect(merge.three).toBe(3);
  });
});

describe('randStr', () => {
  const strOne = randStr(10),
        strTwo = randStr(10),
        strThree = randStr(25),
        strFour = randStr(25);

  test('should produce strings of deterministic length', () => {
    expect(strOne.length).toBe(strTwo.length);
    expect(strThree.length).toBe(strFour.length);

    expect(strOne.length).not.toBe(strThree.length);
    expect(strOne.length).not.toBe(strFour.length);
    expect(strTwo.length).not.toBe(strThree.length);
    expect(strTwo.length).not.toBe(strFour.length);
  });

  test('should produce sufficiently random output', () => {
    expect(strOne).not.toBe(strTwo);
    expect(strOne).not.toBe(strThree);
    expect(strOne).not.toBe(strFour);
    expect(strTwo).not.toBe(strThree);
    expect(strTwo).not.toBe(strFour);
    expect(strThree).not.toBe(strFour);
  })
});

describe('randInt', () => {
  const intOne = randInt(10, 35),
        intTwo = randInt(86, 114),
        intThree = randInt(3, 7),
        intFour = randInt(97, 101);

  test('should produce integers only within the provided range', () => {
    expect(intOne >= 10 && intOne <= 35).toBeTruthy();
    expect(intTwo >= 86 && intTwo <= 114).toBeTruthy();
    expect(intThree >= 3 && intThree <= 7).toBeTruthy();
    expect(intFour >= 97 && intFour <= 101).toBeTruthy();
  });

  test('should produce sufficiently random output', () => {
    expect(intOne).not.toBe(intTwo);
    expect(intOne).not.toBe(intThree);
    expect(intOne).not.toBe(intFour);
    expect(intTwo).not.toBe(intThree);
    expect(intTwo).not.toBe(intFour);
    expect(intThree).not.toBe(intFour);
  });
});

describe('isInt', () => {
  const i = isInt(1),
        s = isInt('1'),
        f = isInt(() => 1),
        o = isInt({
          one: 1,
        });

  test('should return true for integers', () => {
    expect(i).toBeTruthy();
  });

  test('should return convert strings to integers', () => {
    expect(s).toBeTruthy();
  });

  test('should return false for non-integers (e.g. – functions)', () => {
    expect(f).toBeFalsy();
  });

  test('should return false for non-integers (e.g. – objects)', () => {
    expect(o).toBeFalsy();
  });
});
