import {signal, eventConfig as ec} from "core/core";


const fireType = 'fire';
const iceType = 'ice';

const purchasableTowersConfig = [
  {cost: 20, label:'fire', type: fireType, enabled: true,},
  {cost: 30, label:'ice', type: iceType, enabled: true},
];

/**
 * Contains items for the player.
 * Handles orchestration of upgrade tower menu selections.
 */
export default class PlayerItems{
  coins = 0 //what player spends and earns
  purchasableTowers=[] //sent to TowerUpgradeMenu
  constructor({coins=100, purchasableTowers=purchasableTowersConfig}={}){
    this.coins = coins;
    this.purchasableTowers = purchasableTowers;
    signal.registerSignals(this);
    signal.trigger(ec.playerItems.purchasableTowersChanged, {purchasableTowers});
  }

  signals = {
    [ec.towerFoundation.selectedByPlayer]({towerFoundation, purchasableTowers=this.purchasableTowers}){
      console.log(`PlayerItems towerFoundation.selectedByPlayer. displaying upgrade menu`, towerFoundation.getTowerUpgradeInfo());
      const towerUpgradeInfo = towerFoundation.getTowerUpgradeInfo();
      signal.trigger(ec.towerUpgradeMenu.show, {towerFoundation, purchasableTowers, towerUpgradeInfo});
    },
    [ec.towerUpgradeMenu.upgradeTowerButtonClicked]({}){

    },
    [ec.towerUpgradeMenu.sellTowerButtonClicked]({}){

    },
    [ec.towerUpgradeMenu.purchaseTowerClicked]({purchasableTower, towerFoundation}){
      console.log(`PlayerItems received purchaseTowerClicked for: `, towerFoundation);
    }
  }
}

function createTowerBasedOnPurchasableTowerConfig({cost, label, type}){
  let result;
  switch(type){
    case fireType:
      break;
    default:
      console.error(`unknown tower type: ${type}`);
      break;
  }
  return result
}