import {
  arrayBufferToBase64,
  toInt,
  msToStamp,
  toDuration
} from "./convert";

describe("arrayBufferToBase64", () => {
  it("should convert ArrayBuffer objects to Base64", () => {
    let buffer;

    const resultA = 8;
    const resultB = "AAAAAAAAAAA=";

    buffer = new ArrayBuffer(8);
    expect(buffer.byteLength).toBe(resultA);

    buffer = arrayBufferToBase64(buffer);
    expect(buffer).toBe(resultB);
  });
});

describe("toInt", () => {
  it("should return an integer if already of type int", () => {
    const inputA = -4;
    const inputB = 4;
    const inputC = 4444;
    const inputD = 44444444;

    const outputA = -4;
    const outputB = 4;
    const outputC = 4444;
    const outputD = 44444444;

    expect(toInt(inputA)).toBe(outputA);
    expect(toInt(inputB)).toBe(outputB);
    expect(toInt(inputC)).toBe(outputC);
    expect(toInt(inputD)).toBe(outputD);
  });

  it("should convert strings to integers", () => {
    const inputA = "-4";
    const inputB = "4";
    const inputC = "4444";
    const inputD = "44444444";

    const outputA = -4;
    const outputB = 4;
    const outputC = 4444;
    const outputD = 44444444;

    expect(toInt(inputA)).toBe(outputA);
    expect(toInt(inputB)).toBe(outputB);
    expect(toInt(inputC)).toBe(outputC);
    expect(toInt(inputD)).toBe(outputD);
  });

  it("should handle erroneous input", () => {
    const inputA = Infinity;
    const inputB = "test" + 0;
    const inputC = null;
    const inputD = "";

    const outputA = null;
    const outputB = null;
    const outputC = null;
    const outputD = null;

    expect(toInt(inputA)).toBe(outputA);
    expect(toInt(inputB)).toBe(outputB);
    expect(toInt(inputC)).toBe(outputC);
    expect(toInt(inputD)).toBe(outputD);
  });
});

describe("msToStamp", () => {
  it("should handle seconds", () => {
    const inputA = 0;
    const inputB = 4000;
    const inputC = 44000;

    const outputA = "0:00";
    const outputB = "0:04";
    const outputC = "0:44";

    expect(msToStamp(inputA)).toBe(outputA);
    expect(msToStamp(inputB)).toBe(outputB);
    expect(msToStamp(inputC)).toBe(outputC);
  });

  it("should handle corner-case second values", () => {
    const inputA = -4000;
    const inputB = 60000;

    const outputA = "0:00";
    const outputB = "1:00";

    expect(msToStamp(inputA)).toBe(outputA);
    expect(msToStamp(inputB)).toBe(outputB);
  });

  it("should handle minutes", () => {
    const inputA = 64000;
    const inputB = 666000;
    const inputC = 1833000;
    const inputD = 3599000;

    const outputA = "1:04";
    const outputB = "11:06";
    const outputC = "30:33";
    const outputD = "59:59";

    expect(msToStamp(inputA)).toBe(outputA);
    expect(msToStamp(inputB)).toBe(outputB);
    expect(msToStamp(inputC)).toBe(outputC);
    expect(msToStamp(inputD)).toBe(outputD);
  });

  it("should handle corner-case minute values", () => {
    const input = 3600000;
    const output = "1:00:00";

    expect(msToStamp(input)).toBe(output);
  });

  it("should handle hours", () => {
    const inputA = 3604000;
    const inputB = 3644000;
    const inputC = 3884000;
    const inputD = 6284000;
    const inputE = 161084000;

    const outputA = "1:00:04";
    const outputB = "1:00:44";
    const outputC = "1:04:44";
    const outputD = "1:44:44";
    const outputE = "44:44:44";

    expect(msToStamp(inputA)).toBe(outputA);
    expect(msToStamp(inputB)).toBe(outputB);
    expect(msToStamp(inputC)).toBe(outputC);
    expect(msToStamp(inputD)).toBe(outputD);
    expect(msToStamp(inputE)).toBe(outputE);
  });
});

describe("toDuration", () => {
  it("should handle second format variations", () => {
    const inputA = "PT0S";
    const inputB = "PT0.0S";
    const inputC = "PT1.5S";
    const inputD = "PT2.0S";
    const inputE = "PT3.00S";

    const outputA = 0;
    const outputB = 0;
    const outputC = 1500;
    const outputD = 2000;
    const outputE = 3000;

    expect(toDuration(inputA)).toBe(outputA);
    expect(toDuration(inputB)).toBe(outputB);
    expect(toDuration(inputC)).toBe(outputC);
    expect(toDuration(inputD)).toBe(outputD);
    expect(toDuration(inputE)).toBe(outputE);
  });

  it("should handle minute format variations", () => {
    const inputA = "PT12M14S";
    const inputB = "PT634.566S";
    const inputC = "PT9M56.458S";

    const outputA = 734000;
    const outputB = 634566;
    const outputC = 596458;

    expect(toDuration(inputA)).toBe(outputA);
    expect(toDuration(inputB)).toBe(outputB);
    expect(toDuration(inputC)).toBe(outputC);
  });

  it("should handle hour format variations", () => {
    const inputA = "PT0H0M0S";
    const inputB = "PT0H9M56.46S";
    const inputC = "PT4H0M0.0000S";

    const outputA = 0;
    const outputB = 596460;
    const outputC = 14400000;

    expect(toDuration(inputA)).toBe(outputA);
    expect(toDuration(inputB)).toBe(outputB);
    expect(toDuration(inputC)).toBe(outputC);
  });

  it(`should handle formats in excess of 23 hours`, () => {
    const inputA = "P3Y6M4DT12H30M5S";
    const inputB = "P1Y4M3W2DT10H31M3.452S";

    const outputA = 110239565000;
    const outputB = 43721703452;

    expect(toDuration(inputA)).toBe(outputA);
    expect(toDuration(inputB)).toBe(outputB);
  });
});
