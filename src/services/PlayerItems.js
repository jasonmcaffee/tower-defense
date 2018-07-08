import {signal, eventConfig as ec} from "core/core";


const fireType = 'fire';
const iceType = 'ice';

const purchasableTowersConfig = [
  {cost: 20, label:fireType, type: fireType, enabled: true,},
  {cost: 30, label:iceType, type: iceType, enabled: true},
];

/**
 * Contains items for the player.
 * Handles orchestration of upgrade tower menu selections (user clicks on tower, then is displayed menu, then clicks upgrade, etc)
 */
export default class PlayerItems{
  coins = 0 //what player spends and earns
  purchasableTowers=[] //sent to TowerUpgradeMenu
  constructor({coins=100, purchasableTowers=purchasableTowersConfig}={}){
    this.coins = coins;
    signal.trigger(ec.playerItems.playerCoinsChanged, {playerCoins: this.coins});
    this.purchasableTowers = purchasableTowers;
    signal.registerSignals(this);
    signal.trigger(ec.playerItems.purchasableTowersChanged, {purchasableTowers});
  }

  signals = {

    /**
     * When the player selects a TowerFoundation, we want to display the upgrade/purchase menu to the user.
     * @param towerFoundation
     * @param purchasableTowers
     */
    [ec.towerFoundation.selectedByPlayer]({towerFoundationId, towerUpgradeInfo, purchasableTowers=this.purchasableTowers}){
      console.log(`PlayerItems towerFoundation.selectedByPlayer. displaying upgrade menu`, towerUpgradeInfo, towerFoundationId);
      signal.trigger(ec.towerUpgradeMenu.show, {towerFoundationId, purchasableTowers, towerUpgradeInfo});
    },
    [ec.towerUpgradeMenu.upgradeTowerButtonClicked]({}){

    },
    [ec.towerUpgradeMenu.sellTowerButtonClicked]({}){

    },

    /**
     * Trust that the purchasableTower is valid for now... (makes orchestration easier. otherwise need to validate)
     * @param purchasableTower
     * @param towerFoundationId
     */
    [ec.towerUpgradeMenu.purchaseTowerClicked]({purchasableTower, towerFoundationId}){
      console.log(`PlayerItems received purchaseTowerClicked for: `, towerFoundationId);
      if(purchasableTower.cost > this.coins){
        return console.warn(`tower costs more than player has`);
      }
      this.coins -= purchasableTower.cost;
      signal.trigger(ec.towerFoundation.createAndPlaceTower, {towerFoundationId, towerType: purchasableTower.type});
      signal.trigger(ec.playerItems.playerCoinsChanged, {playerCoins: this.coins});
    }
  }
}