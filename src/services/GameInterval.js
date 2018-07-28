import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Provides interval like functionality with added functionality for game pause and game unpause.
 * We don't want to run the interval when the game is paused.
 * When the game resumes, we want to have the interval run as if it never had been interrupted.

 Example: Run interval every 10 seconds
 0  - new GameInterval(fun(), 10,000)
 10 - interval runs. run again in 10 seconds
 15 - game paused at 15 seconds
 15 - stop interval. lastRan at 10 seconds. remainingIntervalMs = now - lastRanTime == 5 seconds
 23 - unpause game at 23 seconds (interval should run in 5 seconds from now)
 23 - runInterval({intervalMs: remainingIntervalMs})
 28 - interval runs
 28 - runInterval()
 38 - interval runs
 */
export default class GameInterval{
  constructor({intervalFunction, intervalMs}){
    this.isGamePaused = false;
    this.timeoutId = undefined;
    this.intervalFunction = intervalFunction;
    this.intervalMs = intervalMs;
    signal.registerSignals(this);
    this.runInterval();
  }

  signals = {
    [ec.game.pauseGame](){
      clearTimeout(this.timeoutId);
      this.remainingIntervalMs = Date.now() - this.timeIntervalWasLastRan;
      console.log(`GameInterval paused. remainingIntervalMs: ${this.remainingIntervalMs}`)
    },
    [ec.game.unpauseGame](){
      console.log(`GameInterval unpaused.`);
      this.runInterval({intervalMs: this.remainingIntervalMs});
    }
  }

  runInterval({intervalFunction=this.intervalFunction, intervalMs=this.intervalMs}={}){
    console.log(`GameInterval runInterval called. intervalMs: ${intervalMs}`);
    const self = this;
    this.timeIntervalWasLastRan = Date.now();
    this.timeoutId = setTimeout(()=>{
      self.timeIntervalWasLastRan = Date.now();
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