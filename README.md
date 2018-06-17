# pepper

[![CircleCI](https://circleci.com/gh/chris-calo/pepper-player.svg?style=shield&circle-token=0c5dc10e0b028da9d6e882f19944f7fd21ae318c)](https://circleci.com/gh/chris-calo/pepper-player)
[![Coverage Status](https://coveralls.io/repos/github/chris-calo/pepper-player/badge.svg?branch=master&t=dP79wl)](https://coveralls.io/github/chris-calo/pepper-player?branch=master)
![Github file size](http://shields.git.vulcanca.com/github/size/chris-calo/pepper-player/lib/pepper.js.gz.svg)

A JavaScript-based MPEG-DASH player, for use in modern desktop and mobile
browsers.

Features include:

- [x] Less than 10 KB in size
- [x] No runtime dependencies
- [x] Ultra low-latency start times (even up to 4K)
- [x] Automatic or manual adaptive quality
- [x] Lazy loading of media segments (reduces serving bandwidth)
- [x] Cross-browser compatible (<= ES7)
- [x] Fully tested, ~100% coverage

Being incorporated from working prototype now:

- [ ] Hooks for custom user-interface
- [ ] Developer-friendly hooks for analysis, inline ads, et cetera
- [ ] Client-side, on-the-fly HLS conversion
- [ ] Mobile compatible
- [ ] Usage documentation
- [ ] Contribution info

## dev installation
```
λ git clone https://github.com/chris-calo/pepper-player.git
λ cd pepper-player
λ npm i
λ npm run build && cd lib && python -m http.server
```
