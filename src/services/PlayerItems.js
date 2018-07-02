import {signal, eventConfig as ec} from "core/core";

export default class PlayerItems{
  coins = 0 //what player spends and earns

  constructor({coins=100}){
    this.coins = coins;
    signal.registerSignals(this);
  }

  signals = {
    
  }
}