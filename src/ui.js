import React from 'react';
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

//////////
//////////
//////////
/// XXX TOO MUCH LOGIC BELOW; PULL ONLY NECESSARY COMPONENTS OUT TO PROPS
//////////
//////////
//////////
class QualityControl extends React.Component {
  /*
  componentDidUpdate(prevProps, prevState) {
    if (prevState.qualities[0].id !== this.props.id) {
      console.log("SHOULD BE REDRAWING");
      const prev = prevState.qualities;

      let qualities = prev.slice(1, prev.length - 1);
      qualities.unshift({
        name: prev[0].name,
        repID: this.props.id,
        selected: prev[0].selected,
        weight: prev[0].weight,
      });

      this.setState({
        qualities: qualities,
      });
    }
  }
  */

  handleClick(index) {
    this.props.qualities.map((quality, i) => {
      if (i === index) { this.props.guts.queueQuality(quality); }
      return null;
    });
  }

  render() {
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
  render() {
    return (
      <div className="pepper-ui">
        <QualityControl id={this.props.id} guts={this.props.guts}
        qualities={this.props.qualities} />
      </div>
    );
  }
}

export { TestUI };
