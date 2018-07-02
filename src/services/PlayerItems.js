import {signal, eventConfig as ec} from "core/core";


const purchasableTowersConfig = [
  {cost: 20, label:'fire', type: 'fire'},
  {cost: 30, label:'ice', type: 'ice'},
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
      console.log(`PlayerItems towerFoundation.selectedByPlayer. displaying upgrade menu`);
      signal.trigger(ec.towerUpgradeMenu.show, {towerFoundation, purchasableTowers});
    },
    [ec.towerUpgradeMenu.upgradeTowerButtonClicked]({towerFoundation}){

    },
    [ec.towerUpgradeMenu.sellTowerButtonClicked]({towerFoundation}){

    },
  }
}