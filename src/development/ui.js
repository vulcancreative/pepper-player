import React from 'react';
import classNames from 'classnames/bind';

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
      <video width="640" height="480" controls></video>
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
      const qualityClass = classNames({
        "quality": true,
        "selected": quality.selected,
        "auto-selected": i !== 0 && auto && quality.repID === autoRep,
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

class TestUI extends React.Component {
  componentDidMount() {
    console.warn("Using development UI");
  }

  render() {
    return (
      <div>
        <Video/>
        <div className="pepper-ui">
          <BufferDepth guts={this.props.guts} />
          <QualityControl id={this.props.id} guts={this.props.guts}
          qualities={this.props.qualities} />
        </div>
      </div>
    );
  }
}

export default TestUI;
