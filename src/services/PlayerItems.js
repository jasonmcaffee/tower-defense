import {signal, eventConfig as ec} from "core/core";

export default class PlayerItems{
  coins = 0 //what player spends and earns

  constructor({coins=100}){
    this.coins = coins;
    signal.registerSignals(this);
  }

  signals = {
    [ec.towerFoundation.selectedByPlayer]({towerFoundation}){
      console.log(`PlayerItems towerFoundation.selectedByPlayer. displaying upgrade menu`);
      signal.trigger(ec.towerUpgradeMenu.show, {towerFoundation, coins: this.coins});
    }
  }
}