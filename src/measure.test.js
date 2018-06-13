import {
  kbps,
  speedFactor,
} from './measure';

describe('kbps', () => {
  it('should take a bytes and a time (ms), returning kbps', () => {
    const inputA = [100, 4];
    const inputB = [44444, 8234];
    const inputC = [123456789, 65432];

    const outputA = 0.20;
    const outputB = 0.04;
    const outputC = 14.74;

    expect(kbps(...inputA)).toBe(outputA);
    expect(kbps(...inputB)).toBe(outputB);
    expect(kbps(...inputC)).toBe(outputC);
  });
});

describe('speedFactor', () => {
  it('should convert download speed to meaningful metrics', () => {
    const inputA = [0.20, 100, 4];
    const inputB = [0.04, 44444, 8234];
    const inputC = [14.74, 123456789, 65432];

    const outputA = 976.56;
    const outputB = 1054.22;
    const outputC = 1000.04;

    // TODO: add more real-world examples

    expect(speedFactor(...inputA)).toBe(outputA);
    expect(speedFactor(...inputB)).toBe(outputB);
    expect(speedFactor(...inputC)).toBe(outputC);
  });
});
