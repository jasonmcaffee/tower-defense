import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class TowerUpgradeMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      visible: false,
      purchasableTowers: [],
      towerFoundation: undefined, //currently selected towerFoundation
    };
  }

  componentWillMount(){
     signal.registerSignals(this);
  }
  componentWillUnmount(){
     signal.unregisterSignals(this);
  }
  signals = {
    [ec.towerUpgradeMenu.show]({towerFoundation, purchasableTowers}){
      this.setState({visible: true, towerFoundation, purchasableTowers});
    },
    [ec.towerUpgradeMenu.hide](){
      this.setState({visible: false});
    },
    [ec.playerItems.purchasableTowersChanged]({purchasableTowers}){
      this.setState({purchasableTowers});
    },
  }

  handleUpgradeButtonClick(e){
    console.log(`handleUpgradeButtonClick`);
    signal.trigger(ec.towerUpgradeMenu.upgradeTowerButtonClicked, {});
  }
  handleSellButtonClick(e){
    signal.trigger(ec.towerUpgradeMenu.sellTowerButtonClicked, {});
  }
  handlePurchaseTowerButtonClick(purchasableTower, e){
    console.log(`purchasable tower clicked: `, purchasableTower);
  }
  render(){
    let {label, onClick, className} = this.props;
    let {visible, purchasableTowers} = this.state;
    if(!visible){return null;}
    className = className || "tower-upgrade-menu";
    const purchasableTowerElements = this.createPurchasableTowerElements({purchasableTowers});

    return(
      <div className={className}>
        Tower Upgrade Menu
        <upgrade-tower-button onClick={this.handleUpgradeButtonClick.bind(this)}>Upgrade</upgrade-tower-button>
        <sell-tower-button onClick={this.handleSellButtonClick.bind(this)} >Sell</sell-tower-button>
        <purchasable-towers>
          {purchasableTowerElements}
        </purchasable-towers>
      </div>
    );
  }
  createPurchasableTowerElements({purchasableTowers}){
    const items = purchasableTowers.map(pt=>{
      return (
        <purchasable-tower onClick={this.handlePurchaseTowerButtonClick.bind(this, pt)}>
          <label>{pt.label}</label>
          <cost>{pt.cost}</cost>
          <type>{pt.type}</type>
        </purchasable-tower>)
    });
    return items;
  }

}