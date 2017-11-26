import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class TopBar extends React.Component {
  constructor(){
    super();
    this.state = {hitPoints:0};
  }
  signals ={
    [ec.player.hitPointsChanged]({hitPoints}){
      console.log('player hitpoints change')
      this.setState({playerHitPoints:hitPoints});
    }
  }
  componentWillMount(){
    signal.registerSignals(this);
  }
  componentWillUnmount(){
    signal.unregisterSignals(this);
  }
  render(){
    let {playerHitPoints} = this.state;
    return(
      <div className="top-bar-component">
        <div className="player-hit-points">
          HP {playerHitPoints}
        </div>
      </div>
    );
  }

}