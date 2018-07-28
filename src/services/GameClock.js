import {Clock} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Wrapper for threejs Clock.
 * Listens for game pause and unpause events so getDelta is accurate.
 */
export default class GameClock{
  constructor(){
    this.clock = new Clock();
    this.isGamePaused = false;
    signal.registerSignals(this);
  }

  signals = {
    [ec.game.pauseGame](){
      this.isGamePaused = true;
      this.clock.stop();
    },
    [ec.game.unpauseGame](){
      this.isGamePaused = false;
      this.clock.start();
    }
  }
  getDelta(){
    return this.clock.getDelta();
  }
  destroy(){
    signal.unregisterSignals(this);
  }
}