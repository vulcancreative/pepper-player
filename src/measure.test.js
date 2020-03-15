import {
  kbps,
  speedFactor,
  clearBpsHistory,
  pushBpsHistory,
  bpsAvg,
  kbpsAvg
} from "./measure";

describe("kbps", () => {
  it("should take a bytes and a time (ms), returning kbps", () => {
    const inputA = [100, 4];
    const inputB = [44444, 8234];
    const inputC = [123456789, 65432];

    const outputA = 0.2;
    const outputB = 0.04;
    const outputC = 14.74;

    expect(kbps(...inputA)).toBe(outputA);
    expect(kbps(...inputB)).toBe(outputB);
    expect(kbps(...inputC)).toBe(outputC);
  });
});

describe("speedFactor", () => {
  it("should convert download speed to meaningful metrics", () => {
    const inputA = [0.2, 100, 4];
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

describe("clearBpsHistory", () => {
  it("should dump the BPS history vector", () => {
    const inputA = 4;
    const inputB = 6;
    const inputC = 8;

    const outputA = 6.0;
    const outputB = 0.0;
    const outputC = 4.0;

    clearBpsHistory();

    pushBpsHistory(inputA);
    pushBpsHistory(inputB);
    pushBpsHistory(inputC);

    expect(bpsAvg()).toBe(outputA);

    clearBpsHistory();
    expect(bpsAvg()).toBe(outputB);

    pushBpsHistory(inputA);
    expect(bpsAvg()).toBe(outputC);
  });
});

describe("pushBpsHistory", () => {
  it("should push BPS values onto the stack", () => {
    const inputA = 11111.1234;
    const inputB = 1234554321.1234;
    const inputC = 9876543123.1234567;

    const outputA = [11111.12, 10.85];

    const outputB = [617282716.12, 602815.15];

    const outputC = [3703702851.79, 3616897.32];

    clearBpsHistory();

    pushBpsHistory(inputA);
    expect(bpsAvg()).toBe(outputA[0]);
    expect(kbpsAvg()).toBe(outputA[1]);

    pushBpsHistory(inputB);
    expect(bpsAvg()).toBe(outputB[0]);
    expect(kbpsAvg()).toBe(outputB[1]);

    pushBpsHistory(inputC);
    expect(bpsAvg()).toBe(outputC[0]);
    expect(kbpsAvg()).toBe(outputC[1]);
  });
});
