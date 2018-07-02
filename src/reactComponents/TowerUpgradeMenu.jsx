import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class TowerUpgradeMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      visible: false,
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
    },
  }

  handleUpgradeButtonClick(e){
    console.log(`handleUpgradeButtonClick`);
    signal.trigger(ec.towerUpgradeMenu.upgradeTowerButtonClicked, {});
  }
  handleSellButtonClick(e){
    signal.trigger(ec.towerUpgradeMenu.sellTowerButtonClicked, {});
  }
  render(){
    let {label, onClick, className} = this.props;
    let {visible} = this.state;
    if(!visible){return null;}
    className = className || "tower-upgrade-menu";
    return(
      <div className={className}>
        Tower Upgrade Menu
        <upgrade-tower-button onClick={this.handleUpgradeButtonClick.bind(this)}>Upgrade</upgrade-tower-button>
        <sell-tower-button onClick={this.handleSellButtonClick.bind(this)} >Sell</sell-tower-button>
      </div>
    );
  }

}