import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class TopBar extends React.Component {
  constructor(){
    super();
    this.state = {playerHitPoints:0, x:0, y:0, z:0, earthHitPoints:0, playerScore:0};
  }
  signals ={
    [ec.player.hitPointsChanged]({hitPoints}){
      this.setState({playerHitPoints:hitPoints});
    },
    [ec.player.positionChanged]({x,y,z}){
      this.setState({x, y, z});
    },
    [ec.earth.hitPointsChanged]({hitPoints}){
      this.setState({earthHitPoints: hitPoints});
    },
    [ec.player.scoreChanged]({score}){
      this.setState({playerScore:score});
    }
  }
  componentWillMount(){
    signal.registerSignals(this);
  }
  componentWillUnmount(){
    signal.unregisterSignals(this);
  }
  render(){
    let {playerHitPoints, x, y, z, earthHitPoints, playerScore} = this.state;
    let precision = 4;
    x = x.toPrecision(precision);
    y = y.toPrecision(precision);
    z = z.toPrecision(precision);
    return(
      <div className="top-bar-component">
        <div className="player-hit-points">
          HP {playerHitPoints}
        </div>
        <div className="earth-hit-points">
          Earth {earthHitPoints}
        </div>
        <div className="player-score">
          Score {playerScore}
        </div>
        <div className="player-location">
          <span>x: {x} </span>
          <span>y: {y} </span>
          <span>z: {z} </span>
        </div>
      </div>
    );
  }

}