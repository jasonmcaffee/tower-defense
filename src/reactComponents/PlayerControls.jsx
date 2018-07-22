import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class PlayerControls extends React.Component {
  constructor(){
    super();
    this.state = {hitPoints:0, isGamePaused: false};
    signal.registerSignals(this);
  }
  signals ={
    [ec.game.pauseGame](){
      this.setState({isGamePaused: true});
    },
    [ec.game.unpauseGame](){
      this.setState({isGamePaused: false});
    }
  }

  componentWillUnmount(){
    signal.unregisterSignals(this);
  }

  handlePauseResumeGameClick(){
    const {isGamePaused} = this.state;
    console.log(`handlePauseResumeGameClick isGamePaused: ${isGamePaused}`);
    if(isGamePaused){
      signal.trigger(ec.game.unpauseGame, {});
    }else{
      signal.trigger(ec.game.pauseGame, {});
    }

  }
  render(){
    const {isGamePaused} = this.state;
    const pauseResumeGameText = isGamePaused ? 'resume game' : 'pause game';
    return(
      <div className="player-controls-component">
        <div><span>left </span> <span>a</span> </div>
        <div> <span>forward </span> <span>w</span> </div>
        <div> <span>right </span> <span>d</span> </div>
        <div> <span>back </span> <span>s</span> </div>
        <div> <span>up </span> <span>spacebar</span> </div>
        <div> <span>down </span> <span>left shift</span> </div>
        <div onClick={this.handlePauseResumeGameClick.bind(this)}> <span>{pauseResumeGameText} </span> <span> &nbsp; </span> </div>
        <div> <span>fullscreen </span> <span>f</span> </div>
      </div>
    );
  }

}