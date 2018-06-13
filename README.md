# pepper

[![CircleCI](https://circleci.com/gh/chris-calo/pepper-player.svg?style=shield&circle-token=0c5dc10e0b028da9d6e882f19944f7fd21ae318c)](https://circleci.com/gh/chris-calo/pepper-player)

A JavaScript-based MPEG-DASH player, for use in modern desktop and mobile
browsers.

Features include:

- [x] 20 KB – and shrinking!
- [x] No external runtime dependencies
- [x] Ultra low-latency start times
- [x] Automatic or manual adaptive quality
- [x] Lazy loading of media segments (reduces serving bandwidth)
- [x] Cross-browser compatible (<= ES7)

Being incorporated from working prototype now:

- [ ] Developer-friendly hooks for analysis, inline ads, et cetera
- [ ] Client-side, on-the-fly HLS conversion
- [ ] Mobile compatible

## dev installation
```
λ git clone https://github.com/chris-calo/pepper-player.git
λ cd pepper-player
λ npm i
λ npm run build && cd lib && python -m http.server
```
