// import rep from './rep';
import { MPD } from './mpd';
import { 
  tfVodMpd as caseA,
  bbb4kVodMpd as caseB,
  bbb4kThumbnailsVodMpd as caseC,
  echoLiveMpd as caseD,
} from './testdata/mpd.testdata.js';

describe('Rep.initURL', () => {
  it('should identify the correct initURLs', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [
      "/init-stream0.m4s",
      "/init-stream1.m4s",
      "/init-stream2.m4s",
      "/init-stream3.m4s",
    ];
    const outputB = [
      "/bbb_30fps_320x180_200k/bbb_30fps_320x180_200k_0.m4v",
      "/bbb_30fps_320x180_400k/bbb_30fps_320x180_400k_0.m4v",
      "/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v",
      "/bbb_30fps_640x360_800k/bbb_30fps_640x360_800k_0.m4v",
      "/bbb_30fps_640x360_1000k/bbb_30fps_640x360_1000k_0.m4v",
      "/bbb_30fps_768x432_1500k/bbb_30fps_768x432_1500k_0.m4v",
      "/bbb_30fps_1024x576_2500k/bbb_30fps_1024x576_2500k_0.m4v",
      "/bbb_30fps_1280x720_4000k/bbb_30fps_1280x720_4000k_0.m4v",
      "/bbb_30fps_1920x1080_8000k/bbb_30fps_1920x1080_8000k_0.m4v",
      "/bbb_30fps_3840x2160_12000k/bbb_30fps_3840x2160_12000k_0.m4v",
      "/bbb_a64k/bbb_a64k_0.m4a",
    ];
    const outputC = [
      "/bbb_30fps_320x180_200k/bbb_30fps_320x180_200k_0.m4v",
      "/bbb_30fps_320x180_400k/bbb_30fps_320x180_400k_0.m4v",
      "/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v",
      "/bbb_30fps_640x360_800k/bbb_30fps_640x360_800k_0.m4v",
      "/bbb_30fps_640x360_1000k/bbb_30fps_640x360_1000k_0.m4v",
      "/bbb_30fps_768x432_1500k/bbb_30fps_768x432_1500k_0.m4v",
      "/bbb_30fps_1024x576_2500k/bbb_30fps_1024x576_2500k_0.m4v",
      "/bbb_30fps_1280x720_4000k/bbb_30fps_1280x720_4000k_0.m4v",
      "/bbb_30fps_1920x1080_8000k/bbb_30fps_1920x1080_8000k_0.m4v",
      "/bbb_30fps_3840x2160_12000k/bbb_30fps_3840x2160_12000k_0.m4v",
      "/bbb_a64k/bbb_a64k_0.m4a",
      "/",
    ];
    const outputD = [
      "/A48/init.mp4",
      "/V300/init.mp4",
    ];

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps));
        expect(reps.map(r => r.initURL())).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps));
        expect(reps.map(r => r.initURL())).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps));
        expect(reps.map(r => r.initURL())).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps));
        expect(reps.map(r => r.initURL())).toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });

  it('should handle baseURL overrides', () => {
    const inputA = caseA.data;
    const inputB = caseB.data;
    const inputC = caseC.data;
    const inputD = caseD.data;

    const outputA = [
      "/init-stream0.m4s",
      "/init-stream1.m4s",
      "/init-stream2.m4s",
      "/init-stream3.m4s",
    ].map(i => `http://vulcanca.com${i}`);
    const outputB = [
      "/bbb_30fps_320x180_200k/bbb_30fps_320x180_200k_0.m4v",
      "/bbb_30fps_320x180_400k/bbb_30fps_320x180_400k_0.m4v",
      "/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v",
      "/bbb_30fps_640x360_800k/bbb_30fps_640x360_800k_0.m4v",
      "/bbb_30fps_640x360_1000k/bbb_30fps_640x360_1000k_0.m4v",
      "/bbb_30fps_768x432_1500k/bbb_30fps_768x432_1500k_0.m4v",
      "/bbb_30fps_1024x576_2500k/bbb_30fps_1024x576_2500k_0.m4v",
      "/bbb_30fps_1280x720_4000k/bbb_30fps_1280x720_4000k_0.m4v",
      "/bbb_30fps_1920x1080_8000k/bbb_30fps_1920x1080_8000k_0.m4v",
      "/bbb_30fps_3840x2160_12000k/bbb_30fps_3840x2160_12000k_0.m4v",
      "/bbb_a64k/bbb_a64k_0.m4a",
    ].map(i => `http://vulcanca.com${i}`);
    const outputC = [
      "/bbb_30fps_320x180_200k/bbb_30fps_320x180_200k_0.m4v",
      "/bbb_30fps_320x180_400k/bbb_30fps_320x180_400k_0.m4v",
      "/bbb_30fps_480x270_600k/bbb_30fps_480x270_600k_0.m4v",
      "/bbb_30fps_640x360_800k/bbb_30fps_640x360_800k_0.m4v",
      "/bbb_30fps_640x360_1000k/bbb_30fps_640x360_1000k_0.m4v",
      "/bbb_30fps_768x432_1500k/bbb_30fps_768x432_1500k_0.m4v",
      "/bbb_30fps_1024x576_2500k/bbb_30fps_1024x576_2500k_0.m4v",
      "/bbb_30fps_1280x720_4000k/bbb_30fps_1280x720_4000k_0.m4v",
      "/bbb_30fps_1920x1080_8000k/bbb_30fps_1920x1080_8000k_0.m4v",
      "/bbb_30fps_3840x2160_12000k/bbb_30fps_3840x2160_12000k_0.m4v",
      "/bbb_a64k/bbb_a64k_0.m4a",
      "/",
    ].map(i => `http://vulcanca.com${i}`);
    const outputD = [
      "/A48/init.mp4",
      "/V300/init.mp4",
    ].map(i => `http://vulcanca.com${i}`);

    expect.assertions(4);

    const promises = [
      (new MPD({ data: inputA })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps)).map(r => {
          r.baseURL = "http://vulcanca.com/";
          return r;
        });
        expect(reps.map(r => r.initURL())).toEqual(outputA);
      }),
      (new MPD({ data: inputB })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps)).map(r => {
          r.baseURL = "http://vulcanca.com/";
          return r;
        });
        expect(reps.map(r => r.initURL())).toEqual(outputB);
      }),
      (new MPD({ data: inputC })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps)).map(r => {
          r.baseURL = "http://vulcanca.com/";
          return r;
        });
        expect(reps.map(r => r.initURL())).toEqual(outputC);
      }),
      (new MPD({ data: inputD })).setup().then(mpd => {
        let reps = [].concat(...mpd.adps.map((a) => a.reps)).map(r => {
          r.baseURL = "http://vulcanca.com/";
          return r;
        });
        expect(reps.map(r => r.initURL())).toEqual(outputD);
      }),
    ];

    return Promise.all(promises);
  });
});
