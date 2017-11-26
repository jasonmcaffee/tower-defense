import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class PlayerControls extends React.Component {
  constructor(){
    super();
    this.state = {hitPoints:0};
  }

  componentWillMount(){
    // signal.registerSignals(this);
  }
  componentWillUnmount(){
    // signal.unregisterSignals(this);
  }
  render(){
    return(
      <div className="player-controls-component">
        <div><span>left </span> <span>a</span> </div>
        <div> <span>forward </span> <span>w</span> </div>
        <div> <span>right </span> <span>d</span> </div>
        <div> <span>back </span> <span>s</span> </div>
        <div> <span>up </span> <span>spacebar</span> </div>
        <div> <span>down </span> <span>left shift</span> </div>
        <div> <span>fire bullet </span> <span>left mouse</span> </div>
      </div>
    );
  }

}