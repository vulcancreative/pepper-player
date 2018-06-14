import React from 'react';

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

class Video extends React.Component {
  render() {
    return (
      <video></video>
    );
  }
}

class UI extends React.Component {
  render() {
    return (
      <div>
        <Video/>
        <div className="pepper-ui">
        </div>
      </div>
    );
  }
}

export { UI };
