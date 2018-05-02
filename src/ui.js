import { h, render, Component } from 'preact';
import { kStreamType } from './constants';
import classNames from 'classnames/bind';

import './styles/debug.scss';

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

class QualityControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      qualities: this.videoQualities(),
    };
  }

  videoQualities() {
    const mpd = this.props.guts.mpd;
    const adps = mpd.adps;
    
    let qualities = [
      {
        name: "auto",
        repID: this.props.guts.videoStream().id,
        selected: true,
      }
    ];

    for (let i = 0; i != adps.length; i++) {
      const adp = adps[i];

      if (adp.reps.length < 1) { continue; }

      for (let j = 0; j != adp.reps.length; j++) {
        const rep = adp.reps[j];

        if (rep.type === kStreamType.video) {
          const width = rep.width;
          const height = rep.height;

          qualities.push({
            name: `${width}:${height}`,
            repID: adp.reps[j].id,
            selected: false,
          });
        }
      }
    }

    return qualities;
  }

  handleClick(index) {
    this.setState({
      qualities: this.state.qualities.map((quality, i) => {
        if (i === index) { this.props.guts.queueQuality(quality); }

        return {
          name: quality.name,
          repID: quality.repID,
          selected: i === index,
        };
      }),
    });
  }

  render() {
    const auto = this.state.qualities[0].selected;
    const autoRep = this.state.qualities[0].repID;

    const items = this.state.qualities.map((quality, i) => {
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

class UI extends Component {
  render() {
    return (
      <div className="pepper-ui">
        <QualityControl guts={this.props.guts} />
      </div>
    );
  }
}

export { render, UI };
