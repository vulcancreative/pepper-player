import Adp from "./adp";
import { MPD } from "./mpd";
import { kMPDType } from "./constants";
import {
  tfVodMpd as caseA,
  bbb4kVodMpd as caseB,
  bbb4kThumbnailsVodMpd as caseC,
  echoLiveMpd as caseD,
  muxed as caseE,
  noAdps as caseF,
  noDuration as caseG,
  noType as caseH,
  noStartTime as caseI,
  noUpdatePeriod as caseJ,
  zeroUpdatePeriod as caseK,
  positiveUpdatePeriod as caseL
} from "./testdata/mpd.testdata.js";

jest.setTimeout(10000);

describe("MPD.fetch", () => {
  it("should be able to handle URL input", () => {
    const inputB = caseB.url;
    const inputC = caseC.url;
    const inputD = caseD.url;

    const outputB = /.*<MPD/gm;
    const outputC = /.*<MPD/gm;
    const outputD = /.*<MPD/gm;

    expect.assertions(3);

    const promises = [
      new MPD().fetch_(inputB).then(result => {
        expect(result).toMatch(outputB);
      }),
      new MPD().fetch_(inputC).then(result => {
        expect(result).toMatch(outputC);
      }),
      new MPD().fetch_(inputD).then(result => {
        expect(result).toMatch(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should be able to handle data input", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = caseA.data;
    const outputB = caseB.data;
    const outputC = caseC.data;
    const outputD = caseD.data;

    expect.assertions(4);

    const promises = [
      new MPD().fetch_(null, inputA).then(result => {
        expect(result).toBe(outputA);
      }),
      new MPD().fetch_(null, inputB).then(result => {
        expect(result).toBe(outputB);
      }),
      new MPD().fetch_(null, inputC).then(result => {
        expect(result).toBe(outputC);
      }),
      new MPD().fetch_(null, inputD).then(result => {
        expect(result).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should prefer existing data to URL fetches", () => {
    const inputA = [caseB.input, caseA.data];
    const inputB = [caseA.input, caseB.data];
    const inputC = [caseD.input, caseC.data];

    const outputA = caseA.data;
    const outputB = caseB.data;
    const outputC = caseC.data;

    expect.assertions(3);

    const promises = [
      new MPD().fetch_(...inputA).then(result => {
        expect(result).toBe(outputA);
      }),
      new MPD().fetch_(...inputB).then(result => {
        expect(result).toBe(outputB);
      }),
      new MPD().fetch_(...inputC).then(result => {
        expect(result).toBe(outputC);
      })
    ];

    return Promise.all(promises);
  });
});

describe("MPD.adps_", () => {
  it("should identify all adaptations and their child elements", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [2, true];
    const outputB = [2, true];
    const outputC = [3, true];
    const outputD = [2, true];

    expect.assertions(8);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.adps.length).toBe(outputA[0]);
        expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputA[1]);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.adps.length).toBe(outputB[0]);
        expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputB[1]);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.adps.length).toBe(outputC[0]);
        expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputC[1]);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.adps.length).toBe(outputD[0]);
        expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputD[1]);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if no adaptations exist", () => {
    const input = caseF.data;
    const output = "Bad adps";

    expect.assertions(1);
    return expect(new MPD({ data: input }).setup()).rejects.toMatch(
      output
    );
  });
});

describe("MPD.baseURL_", () => {
  it("should identify the BaseURL", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = "/";
    const outputB = "./";
    const outputC = "./";
    const outputD =
      "http://vm2.dashif.org/livesim/" + "segtimeline_1/testpic_2s/";

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should allow for the default BaseURL to be overridden", () => {
    const override = "http://vulcanca.com";

    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = `${override}/`;
    const outputB = `${override}/`;
    const outputC = `${override}/`;
    const outputD = `${override}/`;

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA, base: override }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputA);
      }),
      new MPD({ data: inputB, base: override }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputB);
      }),
      new MPD({ data: inputC, base: override }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputC);
      }),
      new MPD({ data: inputD, base: override }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should allow for bizarre overrides (numbers, etc)", () => {
    const overrideA = 1;
    const overrideB = 4444;
    const overrideC = 444444;

    const inputA = caseA.data;
    const inputB = caseA.data;
    const inputC = caseA.data;

    const outputA = "1/";
    const outputB = "4444/";
    const outputC = "444444/";

    expect.assertions(3);

    const promises = [
      new MPD({ data: inputA, base: overrideA }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputA);
      }),
      new MPD({ data: inputB, base: overrideB }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputB);
      }),
      new MPD({ data: inputC, base: overrideC }).setup().then(mpd => {
        expect(mpd.baseURL).toBe(outputC);
      })
    ];

    return Promise.all(promises);
  });
});

describe("MPD.duration_", () => {
  it("should parse the mediaPresentationDuration, if possible", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = 123500;
    const outputB = 634566;
    const outputC = 634566;
    const outputD = -1;

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.duration).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.duration).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.duration).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.duration).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if no duration exists", () => {
    const input = caseG.data;
    const output = "Bad duration";

    expect.assertions(1);
    return expect(new MPD({ data: input }).setup()).rejects.toMatch(
      output
    );
  });
});

describe("MPD.dvr_", () => {
  it("should parse the timeShiftBufferDepth, if possible", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = 300000;

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.dvr).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.dvr).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.dvr).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.dvr).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });
});

describe("MPD.muxed_", () => {
  it("should be able to identify muxed vs demuxed media", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;
    const inputE = caseE.data;

    const outputA = false;
    const outputB = false;
    const outputC = false;
    const outputD = false;
    const outputE = true;

    expect.assertions(5);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.muxed).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.muxed).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.muxed).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.muxed).toBe(outputD);
      }),
      new MPD({ data: inputE }).setup().then(mpd => {
        expect(mpd.muxed).toBe(outputE);
      })
    ];

    return Promise.all(promises);
  });
});

describe("MPD.type_", () => {
  it("should be able to identify the stream type", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = kMPDType.static;
    const outputB = kMPDType.static;
    const outputC = kMPDType.static;
    const outputD = kMPDType.dynamic;

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.type).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.type).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.type).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.type).toBe(outputD);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if no type exists", () => {
    const input = caseH.data;
    const output = "Bad type";

    expect.assertions(1);
    return expect(new MPD({ data: input }).setup()).rejects.toMatch(
      output
    );
  });
});

describe("MPD.startTime_", () => {
  it("should parse the availabilityStartTime, if present", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = new Date("1970-01-01T00:00:00Z");

    expect.assertions(4);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.startTime).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.startTime).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.startTime).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        const diff = outputD.getTime() - mpd.startTime.getTime();
        expect(Math.abs(diff)).toBeLessThanOrEqual(1000);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if no start time exists", () => {
    const input = caseI.data;
    const output = "Bad start";

    expect.assertions(1);
    return expect(new MPD({ data: input }).setup()).rejects.toMatch(
      output
    );
  });
});

describe("MPD.updatePeriod_", () => {
  it("should parse the minimumUpdatePeriod, if present", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;
    const inputE = caseL.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = 1000;
    const outputE = 3000;

    expect.assertions(5);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputB);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputC);
      }),
      new MPD({ data: inputD }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputD);
      }),
      new MPD({ data: inputE }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputE);
      })
    ];

    return Promise.all(promises);
  });

  it("should fallback to 1000ms if less than 1000ms", () => {
    const inputA = caseK.data;
    const inputB = caseD.data;

    const outputA = 1000;
    const outputB = 1000;

    expect.assertions(2);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputA);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.updatePeriod).toBe(outputB);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if no update period exists", () => {
    const input = caseJ.data;
    const output = "Bad update";

    expect.assertions(1);
    return expect(new MPD({ data: input }).setup()).rejects.toMatch(
      output
    );
  });
});

describe("MPD.xml_", () => {
  it("should not modify DOM objects", () => {
    const base = document.createElement("div");
    const input = base;
    const output = base;

    expect(new MPD().xml_(input).isEqualNode(output)).toBeTruthy();
  });
});

describe("MPD.repByID", () => {
  it("should retrieve reps by IDs", () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;

    const outputA = ["0", "2"];
    const outputB = [
      "bbb_30fps_1024x576_2500k",
      "bbb_30fps_1920x1080_8000k",
      "bbb_30fps_1280x720_4000k",
      "bbb_30fps_1920x1080_8000k"
    ];
    const outputC = [
      "bbb_30fps_320x180_400k",
      "bbb_30fps_768x432_1500k",
      "bbb_30fps_3840x2160_12000k",
      "bbb_30fps_3840x2160_12000k",
      "bbb_30fps_320x180_400k"
    ];

    expect.assertions(11);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        expect(mpd.repByID(outputA[0]).id).toBe(outputA[0]);
        expect(mpd.repByID(outputA[1]).id).toBe(outputA[1]);
      }),
      new MPD({ data: inputB }).setup().then(mpd => {
        expect(mpd.repByID(outputB[0]).id).toBe(outputB[0]);
        expect(mpd.repByID(outputB[1]).id).toBe(outputB[1]);
        expect(mpd.repByID(outputB[2]).id).toBe(outputB[2]);
        expect(mpd.repByID(outputB[3]).id).toBe(outputB[3]);
      }),
      new MPD({ data: inputC }).setup().then(mpd => {
        expect(mpd.repByID(outputC[0]).id).toBe(outputC[0]);
        expect(mpd.repByID(outputC[1]).id).toBe(outputC[1]);
        expect(mpd.repByID(outputC[2]).id).toBe(outputC[2]);
        expect(mpd.repByID(outputC[3]).id).toBe(outputC[3]);
        expect(mpd.repByID(outputC[4]).id).toBe(outputC[4]);
      })
    ];

    return Promise.all(promises);
  });

  it("should throw an error if a corresponding rep is missing", () => {
    const inputA = caseD.data;

    const outputA = ["bbb_30fps_3840x2160_12000k", "V100", "A100"];

    expect.assertions(3);

    const promises = [
      new MPD({ data: inputA }).setup().then(mpd => {
        try {
          mpd.repByID(outputA[0]);
        } catch (e) {
          expect(e).toBe(`Unable to find rep with ID '${outputA[0]}'`);
        }

        try {
          mpd.repByID(outputA[1]);
        } catch (e) {
          expect(e).toBe(`Unable to find rep with ID '${outputA[1]}'`);
        }

        try {
          mpd.repByID(outputA[2]);
        } catch (e) {
          expect(e).toBe(`Unable to find rep with ID '${outputA[2]}'`);
        }
      })
    ];

    return Promise.all(promises);
  });
});
