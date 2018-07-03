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
      towerUpgradeInfo: {sellValue: 0, upgradeCost:0, level: 0, isUpgradable: false},
    };
  }

  componentWillMount(){
     signal.registerSignals(this);
  }
  componentWillUnmount(){
     signal.unregisterSignals(this);
  }
  signals = {
    [ec.towerUpgradeMenu.show]({towerFoundation, purchasableTowers, towerUpgradeInfo}){
      this.setState({visible: true, towerFoundation, purchasableTowers, towerUpgradeInfo});
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
    const {visible, purchasableTowers, towerUpgradeInfo} = this.state;
    const {isUpgradable, missingTower, upgradeCost, sellValue} = towerUpgradeInfo;
    if(!visible){return null;}
    className = className || "tower-upgrade-menu";
    let upgradeButtonClassName = isUpgradable ? "" : "disabled";
    const sellButtonClassName = missingTower ? "disabled" : "";

    const purchasableTowerElements = this.createPurchasableTowerElements({purchasableTowers});

    return(
      <div className={className}>
        Tower Upgrade Menu
        <upgrade-tower-button class={upgradeButtonClassName} onClick={this.handleUpgradeButtonClick.bind(this)}>Upgrade {upgradeCost}</upgrade-tower-button>
        <sell-tower-button class={sellButtonClassName} onClick={this.handleSellButtonClick.bind(this)} >Sell {sellValue}</sell-tower-button>
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
        </purchasable-tower>)
    });
    return items;
  }

}