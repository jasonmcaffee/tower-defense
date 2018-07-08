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
    [ec.towerUpgradeMenu.show]({towerFoundationId, purchasableTowers, towerUpgradeInfo}){
      this.setState({visible: true, towerFoundationId, purchasableTowers, towerUpgradeInfo});
    },
    //after tower has been upgraded, redisplay updated upgrade info.
    [ec.towerFoundation.towerUpgradeInfoChanged]({towerFoundationId, towerUpgradeInfo}){
      console.log(`UpgradeMenu tower upgrade info changed: `, towerUpgradeInfo);
      this.setState({towerFoundationId, towerUpgradeInfo});
    },
    [ec.towerUpgradeMenu.hide](){
      this.setState({visible: false});
    },
    [ec.playerItems.purchasableTowersChanged]({purchasableTowers}){
      this.setState({purchasableTowers});
    },
  }

  handleUpgradeButtonClick(towerFoundationId, towerUpgradeInfo, e){
    signal.trigger(ec.towerUpgradeMenu.upgradeTowerButtonClicked, {towerFoundationId, towerUpgradeInfo});
  }
  handleSellButtonClick(towerFoundationId, towerUpgradeInfo, e){
    signal.trigger(ec.towerUpgradeMenu.sellTowerButtonClicked, {towerFoundationId, towerUpgradeInfo});
  }
  handlePurchaseTowerButtonClick(purchasableTower, towerFoundationId, e){
    console.log(`purchasable tower clicked: `, purchasableTower, towerFoundationId);
    signal.trigger(ec.towerUpgradeMenu.purchaseTowerClicked, {purchasableTower, towerFoundationId}); //let player items know
  }
  render(){
    let {label, onClick, className} = this.props;
    const {visible, purchasableTowers, towerUpgradeInfo, towerFoundationId} = this.state;
    const {isUpgradable, missingTower, upgradeCost, sellValue} = towerUpgradeInfo;
    if(!visible){return null;}
    className = className || "tower-upgrade-menu";
    let upgradeButtonClassName = isUpgradable ? "" : "disabled";
    const sellButtonClassName = missingTower ? "disabled" : "";

    const purchasableTowerElements = this.createPurchasableTowerElements({purchasableTowers, towerFoundationId});

    return(
      <div className={className}>
        Tower Upgrade Menu
        <upgrade-tower-button class={upgradeButtonClassName} onClick={this.handleUpgradeButtonClick.bind(this, towerFoundationId, towerUpgradeInfo)}>Upgrade {upgradeCost}</upgrade-tower-button>
        <sell-tower-button class={sellButtonClassName} onClick={this.handleSellButtonClick.bind(this, towerFoundationId, towerUpgradeInfo)} >Sell {sellValue}</sell-tower-button>
        <purchasable-towers>
          {purchasableTowerElements}
        </purchasable-towers>
      </div>
    );
  }
  createPurchasableTowerElements({purchasableTowers, towerFoundationId}){
    const items = purchasableTowers.map(pt=>{
      const className = pt.enabled ? "" : "disabled";
      return (
        <purchasable-tower class={className} onClick={this.handlePurchaseTowerButtonClick.bind(this, pt, towerFoundationId)}>
          <label>{pt.label}</label>
          <cost>{pt.cost}</cost>
        </purchasable-tower>)
    });
    return items;
  }

}