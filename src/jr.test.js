import jr from './jr';

describe('jr.fnc', () => {
  it('should return true for functions', () => {
    const inputA = function() { return 0 };
    const inputB = () => { return 'a' };
    const inputC = function() { return inputA() };
    const inputD = () => { return inputB() };

    expect(jr.fnc(inputA)).toBeTruthy();
    expect(jr.fnc(inputB)).toBeTruthy();
    expect(jr.fnc(inputC)).toBeTruthy();
    expect(jr.fnc(inputD)).toBeTruthy();
  });

  it('should return false for non-functions', () => {
    expect(jr.fnc({})).toBeFalsy();
    expect(jr.fnc([])).toBeFalsy();
    expect(jr.fnc("")).toBeFalsy();
    expect(jr.fnc(0)).toBeFalsy();
  });
});
