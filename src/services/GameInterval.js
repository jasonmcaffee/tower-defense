import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

const consoleLogStyle = `background: #222; color: #bada55`;

/**
 * Provides interval like functionality with added functionality for game pause and game unpause.
 * We don't want to run the interval when the game is paused.
 * When the game resumes, we want to have the interval run as if it never had been interrupted.

 Example: Run interval every 10 seconds
 0 - startGameInterval(fun(), 10,000)
 10 - interval runs. run again in 10 seconds
 12 - game paused at 12 seconds
 12 - stop interval. lastRan at 10 seconds. remainingIntervalMs = intervalMs - (now - lastRanTime) ==  10 - (12 - 10) == 8 seconds
 18 - unpause game at 18 seconds (interval should run in 8 seconds from now)
 18 - runInterval({intervalMs: remainingIntervalMs})
 26 - interval runs
 36 - runInterval()
 46 - interval runs
 */
export default class GameInterval{
  constructor({intervalFunction, intervalMs}){
    this.isGamePaused = false;
    this.timeoutId = undefined;
    this.intervalFunction = intervalFunction;
    this.intervalMs = intervalMs;
    signal.registerSignals(this);
    this.dateIntervalWasLastRan = Date.now();
    this.pauseDurationMs = 0;
    this.runInterval();
  }

  signals = {
    [ec.game.pauseGame](){
      clearTimeout(this.timeoutId);
      this.pauseDate = Date.now();


      // this.remainingIntervalMs = this.intervalMs - ( (Date.now() - this.timeIntervalWasLastRan) % this.intervalMs );
      // console.log(`%c GameInterval paused. remainingIntervalMs: ${this.remainingIntervalMs}`, consoleLogStyle);
    },
    [ec.game.unpauseGame](){
      console.log(`%c GameInterval unpaused.`, consoleLogStyle);
      this.pauseDurationMs += Date.now() - this.pauseDate;//increment in case the game is paused more than once before interval next runs
      const msSinceIntervalWasLastRan = this.pauseDate - this.dateIntervalWasLastRan - this.pauseDurationMs;
      this.remainingIntervalMs = this.intervalMs - msSinceIntervalWasLastRan;
      // this.remainingIntervalMs = this.intervalMs - ( (Date.now() - this.timeIntervalWasLastRan) % this.intervalMs );
      this.runInterval({intervalMs: this.remainingIntervalMs});
    }
  }

  runInterval({intervalFunction=this.intervalFunction, intervalMs=this.intervalMs}={}){
    // console.log(`%c GameInterval runInterval called. intervalMs: ${intervalMs}`, consoleLogStyle);
    const self = this;
    // this.timeIntervalWasLastRan = Date.now();
    this.timeoutId = setTimeout(()=>{
      this.pauseDurationMs = 0;
      console.log(`%c GameInterval executing intervalFunction`, consoleLogStyle);
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