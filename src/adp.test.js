import Rep from './rep';
import { MPD } from './mpd';
import { 
  tfVodMpd as caseA,
  bbb4kVodMpd as caseB,
  bbb4kThumbnailsVodMpd as caseC,
  echoLiveMpd as caseD,
} from './testdata/mpd.testdata.js';

describe('Adp.reps_', () => {
  it('should create the appropriate number of representations', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [4, true];
    const outputB = [11, true];
    const outputC = [12, true];
    const outputD = [2, true];

    expect.assertions(8);

    const promises = [
      (new MPD({ data: inputA })).setup().then((mpd) => {
        let reps = mpd.adps.map((a) => a.reps)
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputA[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputA[1]);
      }),
      (new MPD({ data: inputB })).setup().then((mpd) => {
        let reps = mpd.adps.map((a) => a.reps)
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputB[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputB[1]);
      }),
      (new MPD({ data: inputC })).setup().then((mpd) => {
        let reps = mpd.adps.map((a) => a.reps)
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputC[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputC[1]);
      }),
      (new MPD({ data: inputD })).setup().then((mpd) => {
        let reps = mpd.adps.map((a) => a.reps)
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputD[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputD[1]);
      }),
    ];

    return Promise.all(promises);
  });
});

describe('Adp.bestRep', () => {
  it('should be capable of identifying the best representation', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [2, 0];
    const outputB = [9, 0];
    const outputC = [9, 0, 0];
    const outputD = [0, 0];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.bestRep())).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.bestRep())).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.bestRep())).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.bestRep())).toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});

describe('Adp.strongerRep', () => {
  it('should be capable of choosing a stronger representation', () => {
    const inputA = { data: caseA.data, init: '0' };
    const inputB = { data: caseB.data, init: 'bbb_30fps_320x180_400k' };
    const inputC = { data: caseC.data, init: 'bbb_30fps_320x180_400k' };

    const outputA = '1';
    const outputB = 'bbb_30fps_480x270_600k';
    const outputC = 'bbb_30fps_480x270_600k';

    expect.assertions(3);

    const promises = [
      (new MPD({ data: inputA.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputA.init).id).toBe(outputA);
      }),
      (new MPD({ data: inputB.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputB.init).id).toBe(outputB);
      }),
      (new MPD({ data: inputC.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputC.init).id).toBe(outputC);
      }),
    ];

    return Promise.all(promises);
  });

  it('should return the same rep if nothing better exists', () => {
    const inputA = { data:caseA.data, init:'2' };
    const inputB = { data:caseB.data, init:'bbb_30fps_3840x2160_12000k' };
    const inputC = { data:caseC.data, init:'bbb_30fps_3840x2160_12000k' };
    const inputD = { data:caseD.data, init:'A48' };

    const outputA = '2';
    const outputB = 'bbb_30fps_3840x2160_12000k';
    const outputC = 'bbb_30fps_3840x2160_12000k';
    const outputD = 'A48';

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputA.init).id).toBe(outputA);
      }),
      (new MPD({ data: inputB.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputB.init).id).toBe(outputB);
      }),
      (new MPD({ data: inputC.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputC.init).id).toBe(outputC);
      }),
      (new MPD({ data: inputD.data })).setup().then((mpd) => {
        expect(mpd.adps[0].strongerRep(inputD.init).id).toBe(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});

describe('Adp.weakerRep', () => {
  it('should be capable of choosing a stronger representation', () => {
    const inputA = { data: caseA.data, init: '1' };
    const inputB = { data: caseB.data, init: 'bbb_30fps_640x360_800k' };
    const inputC = { data: caseC.data, init: 'bbb_30fps_320x180_400k' };

    const outputA = '0';
    const outputB = 'bbb_30fps_480x270_600k';
    const outputC = 'bbb_30fps_320x180_200k';

    expect.assertions(3);

    const promises = [
      (new MPD({ data: inputA.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputA.init).id).toBe(outputA);
      }),
      (new MPD({ data: inputB.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputB.init).id).toBe(outputB);
      }),
      (new MPD({ data: inputC.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputC.init).id).toBe(outputC);
      }),
    ];

    return Promise.all(promises);
  });

  it('should return the same rep if nothing lesser exists', () => {
    const inputA = { data: caseA.data, init: '0' };
    const inputB = { data: caseB.data, init: 'bbb_30fps_320x180_200k' };
    const inputC = { data: caseC.data, init: 'bbb_30fps_320x180_200k' };
    const inputD = { data: caseD.data, init: 'A48' };

    const outputA = '0';
    const outputB = 'bbb_30fps_320x180_200k';
    const outputC = 'bbb_30fps_320x180_200k';
    const outputD = 'A48';

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputA.init).id).toBe(outputA);
      }),
      (new MPD({ data: inputB.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputB.init).id).toBe(outputB);
      }),
      (new MPD({ data: inputC.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputC.init).id).toBe(outputC);
      }),
      (new MPD({ data: inputD.data })).setup().then((mpd) => {
        expect(mpd.adps[0].weakerRep(inputD.init).id).toBe(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});

describe('Adp.worstRep', () => {
  it('should be capable of identifying the worst representation', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [0, 0];
    const outputB = [0, 0];
    const outputC = [0, 0, 0];
    const outputD = [0, 0];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.worstRep())).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.worstRep())).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.worstRep())).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then((mpd) => {
        expect(mpd.adps.map(a => a.worstRep())).toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});
