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

    (new MPD({ data: inputA })).setup().then((mpd) => {
      let reps = mpd.adps.map((a) => a.reps)
      reps = [].concat(...reps);

      expect(reps.length).toBe(outputA[0]);
      expect(reps.every(r => r instanceof Rep)).toBe(outputA[1]);
    });
    (new MPD({ data: inputB })).setup().then((mpd) => {
      let reps = mpd.adps.map((a) => a.reps)
      reps = [].concat(...reps);

      expect(reps.length).toBe(outputB[0]);
      expect(reps.every(r => r instanceof Rep)).toBe(outputB[1]);
    });
    (new MPD({ data: inputC })).setup().then((mpd) => {
      let reps = mpd.adps.map((a) => a.reps)
      reps = [].concat(...reps);

      expect(reps.length).toBe(outputC[0]);
      expect(reps.every(r => r instanceof Rep)).toBe(outputC[1]);
    });
    (new MPD({ data: inputD })).setup().then((mpd) => {
      let reps = mpd.adps.map((a) => a.reps)
      reps = [].concat(...reps);

      expect(reps.length).toBe(outputD[0]);
      expect(reps.every(r => r instanceof Rep)).toBe(outputD[1]);
    });
  });
});

describe('Adp.bestRep', () => {
  it('should be capable of identifying the best representation', () => {
  });
});

describe('Adp.strongerRep', () => {
  it('should be capable of choosing a stronger representation', () => {
  });
});

describe('Adp.weakerRep', () => {
  it('should be capable of choosing a weaker representation', () => {
  });
});

describe('Adp.worstRep', () => {
  it('should be capable of identifying the worst representation', () => {
  });
});
