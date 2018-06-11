import React from 'react';
import classnames from 'classnames/bind';
import { msToStamp } from '../convert';
import './ui.scss';

/*
function mouseWatch(e) {
  // TODO
}

function controlShow(d) {
  // TODO
}

function controlHide(d) {
  // TODO
}

function controlToggle(d) {
  // TODO
}

function controlAbortHide(e) {
  // TODO
}

function controlMouseOver(e) {
  // TODO
}

function controlMouseExit(e) {
  // TODO
}

function scrubberClick(e) {
  // TODO
}
*/

//////////
//////////
//////////
/// XXX TOO MUCH LOGIC BELOW; PULL ONLY NECESSARY COMPONENTS OUT TO PROPS
//////////
//////////
//////////
class Video extends React.Component {
  render() {
    return (
      <video></video>
    );
  }
}

class BufferDepth extends React.Component {
  render() {
    const guts = this.props.guts;
    if (guts === null || typeof guts === 'undefined') { return null; }

    const streams = guts.streams;
    if (streams===null || typeof streams==='undefined') { return null; }

    const depth = guts.mpd.dvr ? 
      streams.map((stream) => {
        return (
          <div key={stream.id} className="depth">
            <span className="buffered-time">
              {stream.bufferedLength()}
            </span>
            <span className="divider">/</span>
            <span className="total-depth">
              {guts.mpd.dvr}
            </span>
          </div>
        );
      }) : null;

    return (
      <div className="buffer-depth">
        {depth}
      </div>
    );
  }
}

class Countdown extends React.Component {
  render() {
    const ms = this.props.startsInMs;

    if (ms === null || typeof ms === 'undefined' || ms < 1) {
      return null;
    }

    return (
      <div className="countdown">
        Starts in {ms / 1000} seconds
      </div>
    );
  }
}

class PlayPauseToggle extends React.Component {
  handleClick() {
    if (this.props.isPaused()) {
      this.props.play();
    } else {
      this.props.pause();
    }
  }

  render() {
    const toggleClasses = classnames({
      'toggle': true,
      'play': this.props.isPaused(),
      'pause': !this.props.isPaused(),
    });

    return (
      <div className={toggleClasses} onClick={() => this.handleClick()}>
        {this.props.isPaused() ? "Play" : "Pause"}
      </div>
    );
  }
}

class QualityControl extends React.Component {
  handleClick(index) {
    this.props.qualities.map((quality, i) => {
      if (i === index) { this.props.guts.queueQuality(quality); }
      return null;
    });
  }

  render() {
    if (!this.props.qualities || this.props.qualities.length < 1) {
      return null;
    }

    const auto = this.props.qualities[0].selected;
    const autoRep = this.props.qualities[0].repID;

    const items = this.props.qualities.map((quality, i) => {
      const qualityClass = classnames({
        'quality': true,
        'selected': quality.selected,
        'auto-selected': i !== 0 && auto && quality.repID === autoRep,
      });

      return (
        <div key={quality.name} className={qualityClass}
             onClick={() => this.handleClick(i)}>
          {quality.name}
        </div>
      );
    });

    return (
      <div className="qualities">
        {items}
      </div>
    );
  }
}

class Scrubber extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverPercentage: null,
    };
  }

  buildPreview(percentage = null) {
    const guts = this.props.guts;
    if (guts === null || typeof guts === 'undefined') { return null; }

    const rep = guts.imageStream();
    if (rep === null || typeof rep === 'undefined') { return null; }

    const streams = guts.streams.filter(s => s.type === rep.type);
    const stream = streams[0];

    if (!stream || stream.cache.length < 1) { return null; }

    let current = null, index = 0;
    let image = stream.cache[index];
    // const time = this.props.currentTime();
    const count = image.info.count, len = image.info.duration / count;
    const time = this.props.guts.mpd.duration * (percentage / 100);

    while (time > image.info.duration * (index + 1) && image !== null) {
      index++; image = stream.cache[index];
    }

    if (image === null) { return null; }

    const times = (new Array(count).fill(0)).map((t, i) => {
      return {
        'xOffset': image.info.width / count * -i,
        'start': index * image.info.duration + len * i,
        'end': index * image.info.duration + len * i + len,
      };
    });

    for (let i = 0; i != times.length; i++) {
      const t = times[i];
      if (!current || (time >= t.start && time <= t.end)) { current = t; }
    }

    if (!current) { return null; }

    let previewStyling;

    if (percentage) {
      previewStyling = {
        backgroundImage: `url('data:${image.mime};base64,${image.data}')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `${current.xOffset * 0.5}px 0`,
        backgroundSize: 'cover',
        width: `${image.info.width / count * 0.5}px`,
        height: `${image.info.height * 0.5}px`,
        overflow: 'hidden',
      };
    } else {
      previewStyling = {
        backgroundColor: 'black',
        width: `${image.info.width / count * 0.5}px`,
        height: `${image.info.height * 0.5}px`,
      };
    }

    return (
      <div className="preview" style={previewStyling}></div>
    );
  }

  getCoordinates(e) {
    const area = document.querySelectorAll('.scrubber-activearea')[0];
    const bounds = area.getBoundingClientRect();

    const width = parseInt(getComputedStyle(area).width);
    const height = parseInt(getComputedStyle(area).height);

    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    return { x: x, y: y, width: width, height: height };
  }

  handleClick(e) {
    const { x, width } = this.getCoordinates(e);
    const percentage = Math.ceil(x / width * 100);

    this.props.seek(percentage);
  }

  handleHoverStart(e) {
    const { x, width } = this.getCoordinates(e);
    const percentage = Math.ceil(x / width * 100);

    this.setState({
      hoverPercentage: percentage,
    });
  }

  handleHoverEnd() {
    this.setState({
      hoverPercentage: null,
    });
  }

  render() {
    const guts = this.props.guts;
    if (guts === null || typeof guts === 'undefined') { return null; }

    const mpd = guts.mpd;
    if (mpd === null || typeof mpd === 'undefined') { return null; }

    const stylingInner = {};
    const time = this.props.currentTime();
    const duration = mpd.duration ? mpd.duration : -1;
    const percentage = ((time / duration) || 0) * 100;

    if (duration > -1) { stylingInner.width = `${percentage}%`; }

    const preview = duration > -1 ?
      this.buildPreview(this.state.hoverPercentage) :
      null;

    return (
      <div className="scrubber-container">
        {preview}
        <div className="scrubber-activearea"
             onClick={(e) => this.handleClick(e)}
             onMouseMove={(e) => this.handleHoverStart(e)}
             onMouseOut={() => this.handleHoverEnd()}>
          <div className="scrubber-outer">
            <div className="scrubber-inner" style={stylingInner}>
              <div className="scrubber-handle" ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Timeline extends React.Component {
  render() {
    const guts = this.props.guts;
    if (guts === null || typeof guts === 'undefined') { return null; }

    const video = guts.video;
    if (video === null || typeof video === 'undefined') { return null; }

    const mpd = guts.mpd;
    if (mpd === null || typeof mpd === 'undefined') { return null; }

    const len = mpd.duration > -1 ? msToStamp(mpd.duration) : -1;
    const time = msToStamp(video.currentTime * 1000);

    return (
      <div className="timeline">
        <div className="timestamp">
          {time} / {len}
        </div>
      </div>
    )
  }
}

class UI extends React.Component {
  componentDidMount() {
    console.warn("Using development UI");
  }

  render() {
    return (
      <div>
        <Video/>

        <Scrubber guts={this.props.guts}
                  seek={this.props.seek}
                  currentTime={this.props.currentTime} />

        <div className="pepper-ui">
          <QualityControl id={this.props.id}
                          guts={this.props.guts}
                          qualities={this.props.qualities} />

          <BufferDepth guts={this.props.guts} />

          <PlayPauseToggle play={this.props.play}
                           pause={this.props.pause}
                           isPaused={this.props.isPaused} />

          <Timeline guts={this.props.guts} />

          <Countdown startsInMs={this.props.startsInMs} />
        </div>
      </div>
    );
  }
}

export { UI };
