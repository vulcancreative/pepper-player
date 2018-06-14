import Adp from './adp';
import { MPD } from './mpd';
import { 
  tfVodMpd as caseA,
  bbb4kVodMpd as caseB,
  bbb4kThumbnailsVodMpd as caseC,
  echoLiveMpd as caseD,
} from './testdata/mpd.testdata.js';

describe('MPD.fetch', () => {
  it('should be able to handle URL input', () => {
    const inputA = caseA.url;
    const inputB = caseB.url;
    const inputC = caseC.url;

    const outputA = caseA.data;
    const outputB = caseB.data;
    const outputC = caseC.data;

    (new MPD()).fetch_(inputA).then((result) => {
      expect(result).toBe(outputA);
    });
    (new MPD()).fetch_(inputB).then((result) => {
      expect(result).toBe(outputB);
    });
    (new MPD()).fetch_(inputC).then((result) => {
      expect(result).toBe(outputC);
    });
  });

  it('should fail loudly on invalid URLs', () => {
    const input = 'http://vulcanca.balls/test.mpd';
    expect((new MPD()).fetch_(input)).rejects.toMatch(
      "Attempt to fetch MPD failed"
    );
  });

  it('should be able to handle data input', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;

    const outputA = caseA.data;
    const outputB = caseB.data;
    const outputC = caseC.data;

    (new MPD()).fetch_(null, inputA).then((result) => {
      expect(result).toBe(outputA);
    });
    (new MPD()).fetch_(null, inputB).then((result) => {
      expect(result).toBe(outputB);
    });
    (new MPD()).fetch_(null, inputC).then((result) => {
      expect(result).toBe(outputC);
    });
  });

  it('should prefer existing data to URL fetches', () => {
    const inputA = [caseB.input, caseA.data];
    const inputB = [caseA.input, caseB.data];
    const inputC = [caseD.input, caseC.data];

    const outputA = caseA.data;
    const outputB = caseB.data;
    const outputC = caseC.data;

    (new MPD()).fetch_(...inputA).then(result => {
      expect(result).toBe(outputA);
    });
    (new MPD()).fetch_(...inputB).then(result => {
      expect(result).toBe(outputB);
    });
    (new MPD()).fetch_(...inputC).then(result => {
      expect(result).toBe(outputC);
    });
  });
});

describe('MPD.parse_', () => {
  it('should assemble reasonable outputs', () => {
  });
});

describe('MPD.adps_', () => {
  it('should identify all adaptations and their child elements', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [2, true];
    const outputB = [2, true];
    const outputC = [3, true];
    const outputD = [2, true];

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.adps.length).toBe(outputA[0]);
      expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputA[1]);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.adps.length).toBe(outputB[0]);
      expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputB[1]);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.adps.length).toBe(outputC[0]);
      expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputC[1]);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.adps.length).toBe(outputD[0]);
      expect(mpd.adps.every(a => a instanceof Adp)).toBe(outputD[1]);
    });
  });
});

describe('MPD.baseURL_', () => {
  it('should identify the BaseURL', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = '/';
    const outputB = './';
    const outputC = './';
    const outputD = 'http://vm2.dashif.org/livesim/' +
                    'segtimeline_1/testpic_2s/';

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputD);
    });
  });

  it('should allow for the default BaseURL to be overridden', () => {
    const override = 'http://vulcanca.com';

    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = `${override}/`;
    const outputB = `${override}/`;
    const outputC = `${override}/`;
    const outputD = `${override}/`;

    (new MPD({ data: inputA, base: override })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputA);
    });
    (new MPD({ data: inputB, base: override })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputB);
    });
    (new MPD({ data: inputC, base: override })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputC);
    });
    (new MPD({ data: inputD, base: override })).setup().then((mpd) => {
      expect(mpd.baseURL).toBe(outputD);
    });
  });
});

describe('MPD.duration_', () => {
  it('should parse the mediaPresentationDuration, if possible', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = 123500;
    const outputB = 634566;
    const outputC = 634566;
    const outputD = -1;

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.duration).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.duration).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.duration).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.duration).toBe(outputD);
    });
  });
});

describe('MPD.dvr_', () => {
  it('should parse the timeShiftBufferDepth, if possible', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = 300000;

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.dvr).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.dvr).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.dvr).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.dvr).toBe(outputD);
    });
  });
});

describe('MPD.muxed_', () => {
  it('should be able to identify muxed vs demuxed media', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = false;
    const outputB = false;
    const outputC = false;
    const outputD = false;

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.muxed).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.muxed).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.muxed).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.muxed).toBe(outputD);
    });
  });
});

describe('MPD.type_', () => {
  it('should be able to identify the stream type', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = 'static';
    const outputB = 'static';
    const outputC = 'static';
    const outputD = 'dynamic';

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.type).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.type).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.type).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.type).toBe(outputD);
    });
  });
});

describe('MPD.startTime_', () => {
  it('should parse the availabilityStartTime, if present', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = new Date('1970-01-01T00:00:00Z');

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.startTime).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.startTime).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.startTime).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.startTime).toEqual(outputD);
    });
  });
});

describe('MPD.updatePeriod_', () => {
  it('should parse the minimumUpdatePeriod, if present', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = -1;
    const outputB = -1;
    const outputC = -1;
    const outputD = 0;

    (new MPD({ data: inputA })).setup().then((mpd) => {
      expect(mpd.updatePeriod).toBe(outputA);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      expect(mpd.updatePeriod).toBe(outputB);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      expect(mpd.updatePeriod).toBe(outputC);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      expect(mpd.updatePeriod).toBe(outputD);
    });
  });
});
