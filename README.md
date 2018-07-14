# pepper

[![CircleCI](https://circleci.com/gh/vulcancreative/pepper-player.svg?style=shield&circle-token=0c5dc10e0b028da9d6e882f19944f7fd21ae318c)](https://circleci.com/gh/vulcancreative/pepper-player)
[![Coverage Status](https://coveralls.io/repos/github/vulcancreative/pepper-player/badge.svg?branch=master&t=dP79wl)](https://coveralls.io/github/vulcancreative/pepper-player?branch=master)
![Github file size](http://shields.git.vulcanca.com/github/size/vulcancreative/pepper-player/lib/pepper.js.gz.svg)

A JavaScript-based MPEG-DASH player, for use in modern desktop and mobile
browsers.

Features include:

- [x] Less than 10 KB in size
- [x] No runtime dependencies
- [x] Ultra low-latency start times (even up to 4K)
- [x] Automatic or manual adaptive quality
- [x] Lazy loading of media segments (reduces serving bandwidth)
- [x] Client-side, on-the-fly HLS conversion (currently static only)
- [x] Hooks for custom user-interface
- [x] Cross-browser compatible (<= ES8)
- [x] Fully tested, ~100% coverage
- [x] Mobile compatible

Being incorporated from working prototype now:
- [ ] Developer-friendly hooks for analysis, inline ads, et cetera (WIP)
- [ ] Usage documentation

Up next:
- [ ] Contribution info

## dev installation
```
λ git clone https://github.com/chris-calo/pepper-player.git
λ cd pepper-player
λ npm i
λ npm run build && cd lib && http-server --port 8000
```

## versioning

pepper is our interpretation of a [new, living standard](http://standards.iso.org/ittf/PubliclyAvailableStandards/c057623_ISO_IEC_23009-1_2012.zip). But, we frequently liken its lifespan to that of a "perpetually-awkward teenager – complete with headgear, a speech-impediment, and uncomfortably-pointy classroom boners."

We first made the player to help ease the development of a client app, starting in November of 2016. Due to timeline restrictions, we hastily built pepper twice that winter – resulting in v1.0. First written in nasty ol' [CoffeeScript](https://github.com/jashkenas/coffeescript), pepper has since adopted the ECMAScript standard. Our goal is to build a compact, yet quick and maintainable, library. This round-about journey has lead our little player to be re-written ~5 times in 2.5 years… YIKES!

v2.X – the current stable, production version – was scratch-made, using modern practices. It remains the de facto player for many, large clients. Daily, it serves terabytes of on-demand and live clients data to the unaware masses. If asked, most have no idea what pepper is or where it came from. Who knew something so discreet could have such an impact?!

And in case anyone asks… shh… don't tell! It'll spoil the surprise!
