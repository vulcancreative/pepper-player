# pepper

A JavaScript-based MPEG-DASH player, for use in modern desktop and mobile
browsers.

Features include:

* Ultra low-latency start times
* Automatic or manual adaptive quality
* Lazy loading of media segments (reduces serving bandwidth)
* Developer-friendly hooks for analysis, inline ads, et cetera
* Client-side, on-the-fly HLS conversion
* Cross-browser compatible
* Mobile compatible

## dev installation
```
λ git clone https://github.com/chris-calo/pepper-player.git
λ cd pepper-player
λ npm i
λ npm run build && python -m http.server
```
