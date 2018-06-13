import {
  kbps,
} from './measure';

describe('kbps', () => {
  it('should take a bytes and a time (ms), returning kbps', () => {
    const inputA = [100, 4];
    const inputB = [44444, 8234];
    const inputC = [123456789, 65432];

    expect(kbps(...inputA)).toBe(0.20);
    expect(kbps(...inputB)).toBe(0.04);
    expect(kbps(...inputC)).toBe(14.74);
  });
});

describe('speedFactor', () => {
  it('should convert download speed to meaningful metrics', () => {
  });
});
