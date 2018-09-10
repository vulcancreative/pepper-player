import Rep from './rep';
import { MPD } from './mpd';
import { 
  tfVodMpd as caseA,
  bbb4kVodMpd as caseB,
  bbb4kThumbnailsVodMpd as caseC,
  echoLiveMpd as caseD,
  noReps as caseE,
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
      (new MPD({ data: inputA })).setup().then(mpd => {
        console.log(mpd);
        let reps = mpd.adps.map((a) => a.reps);
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputA[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputA[1]);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        let reps = mpd.adps.map((a) => a.reps);
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputB[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputB[1]);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        let reps = mpd.adps.map((a) => a.reps);
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputC[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputC[1]);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        let reps = mpd.adps.map((a) => a.reps);
        reps = [].concat(...reps);

        expect(reps.length).toBe(outputD[0]);
        expect(reps.every(r => r instanceof Rep)).toBe(outputD[1]);
      }),
    ];

    return Promise.all(promises);
  });

  it('should throw an error if no representations exist', () => {
    const inputA = caseE.data;
    const outputA = 'No representations present in adaptation[0]';

    expect.assertions(1);
    
    const promises = [
      (new MPD({ data: inputA })).setup().catch(e =>
        expect(e).toEqual(outputA)
      ),
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

    /*
    const outputA = [2, 0];
    const outputB = [9, 0];
    const outputC = [9, 0, 0];
    const outputD = [0, 0];
    */

    const outputA = ['2', '3'];
    const outputB = ['bbb_30fps_3840x2160_12000k', 'bbb_a64k'];
    const outputC = [
      'bbb_30fps_3840x2160_12000k', 'bbb_a64k', 'thumbnails_320x180'
    ];
    const outputD = ['A48', 'V300'];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputD);
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

    /*
    const outputA = [2, 0];
    const outputB = [9, 0];
    const outputC = [9, 0, 0];
    const outputD = [0, 0];
    */

    const outputA = ['2', '3'];
    const outputB = ['bbb_30fps_3840x2160_12000k', 'bbb_a64k'];
    const outputC = [
      'bbb_30fps_3840x2160_12000k', 'bbb_a64k', 'thumbnails_320x180'
    ];
    const outputD = ['A48', 'V300'];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.bestRep().id)).toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});

describe('Adp.matchBandwidth', () => {
  it('should be capable of identifying a nearest-representation', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = ['0', '3'];
    const outputB = ['bbb_30fps_640x360_800k', 'bbb_a64k'];
    const outputC = [
      'bbb_30fps_640x360_800k', 'bbb_a64k', 'thumbnails_320x180'
    ];
    const outputD = ['A48', 'V300'];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.matchBandwidth(1000000).id))
        .toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.matchBandwidth(1000000).id))
        .toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.matchBandwidth(1000000).id))
        .toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        expect(mpd.adps.map(a => a.matchBandwidth(1000000).id))
        .toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});
