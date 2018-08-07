import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Provides interval like functionality with added functionality for game pause and game unpause.
 * We don't want to run the interval when the game is paused.
 * When the game resumes, we want to have the interval run as if it never had been interrupted.
 */
export default class GameInterval{
  constructor({intervalFunction, intervalMs}){
    this.timeoutId = undefined;
    this.intervalFunction = intervalFunction;
    this.intervalMs = intervalMs;
    signal.registerSignals(this);
    this.dateIntervalWasLastRan = Date.now();
    this.runInterval();
  }

  signals = {
    [ec.game.pauseGame](){
      clearTimeout(this.timeoutId); //prevent the interval function from running
      this.pauseDate = Date.now(); //we need to know how long we've paused the game
    },
    /**
     * We need to make sure that the interval runs precisely when needed, and that game pauses don't alter the interval.
     * i.e. its should be as if the game was never was paused.
     * In order to do this, we record how long the game was paused for, and warp/modify the time the interval was last ran.
     */
    [ec.game.unpauseGame](){
      const pauseDurationMs = Date.now() - this.pauseDate; //how long the game was paused for
      this.dateIntervalWasLastRan += pauseDurationMs;//warp time so it's as if the pause never occurred.
      const msSinceIntervalWasLastRan = Date.now() - this.dateIntervalWasLastRan;
      this.remainingIntervalMs = this.intervalMs - msSinceIntervalWasLastRan;
      this.runInterval({intervalMs: this.remainingIntervalMs});
    }
  }

  runInterval({intervalFunction=this.intervalFunction, intervalMs=this.intervalMs}={}){
    const self = this;
    this.timeoutId = setTimeout(()=>{
      self.dateIntervalWasLastRan = Date.now();
      try{
        intervalFunction();
      }catch(e){
        console.error(`exception in GameClock interval function: `, e);
      }
      self.runInterval();
    }, intervalMs);
  }
  destroy(){
    signal.unregisterSignals(this);
    clearTimeout(this.timeoutId);
  }

}