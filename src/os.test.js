import os from './os';

describe('os.is', () => {
  it('should correctly identify browser by userAgent string', () => {
    const inputA = "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; " +
    "rv:42.0) Gecko/20100101 Firefox/42.0";

    const inputB = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/" +
    "537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36";

    const inputC = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/" +
    "537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 " +
    "OPR/38.0.2220.41";

    const inputD = "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like " +
    "Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 " +
    "Mobile/14E304 Safari/602.1";

    const inputE = "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone " +
    "OS 7.5; Trident/5.0; IEMobile/9.0)";

    const inputF = "Googlebot/2.1 (+http://www.google.com/bot.html)";

    const inputG = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 " +
    "Safari/537.36 Edge/14.14393";

    const outputA = "firefox";
    const outputB = "chrome";
    const outputC = "opera";
    const outputD = "safari";
    const outputE = "ie";
    const outputF = "bot";
    const outputG = "edge";

    expect(os.is(outputA, inputA)).toBeTruthy();
    expect(os.is(outputB, inputB)).toBeTruthy();
    expect(os.is(outputC, inputC)).toBeTruthy();
    expect(os.is(outputD, inputD)).toBeTruthy();
    expect(os.is(outputE, inputE)).toBeTruthy();
    expect(os.is(outputF, inputF)).toBeTruthy();
    expect(os.is(outputG, inputG)).toBeTruthy();
  });
});
