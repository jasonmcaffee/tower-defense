import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class TowerUpgradeMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      visible: true,
    };
  }

  componentWillMount(){
     signal.registerSignals(this);
  }
  componentWillUnmount(){
     signal.unregisterSignals(this);
  }
  signals = {
    [ec.towerUpgradeMenu.show](){
      this.setState({visible: true});
    },
    [ec.towerUpgradeMenu.hide](){
      this.setState({visible: false});
    }
  }

  render(){
    let {label, onClick, className} = this.props;
    let {visible} = this.state;
    if(!visible){return null;}
    className = className || "tower-upgrade-menu";
    return(
      <div className={className}>
        Tower Upgrade Menu
      </div>
    );
  }

}