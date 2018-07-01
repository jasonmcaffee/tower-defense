
import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';
import LevelOne from 'levels/LevelOne';


/**
 * Handles starting/ending game, level progression.
 */
export default class Game{
  constructor({gameConfig=new LevelOne(), threeJsRenderDiv}={}){
    this.gameConfig = gameConfig;
    this.threeJsRenderDiv = threeJsRenderDiv;

    signal.registerSignals(this);
  }

  signals = {
    [ec.game.startGame]({gameConfig=this.gameConfig}={}){
      if(this.stage){
        this.stage.destroy();
      }

      this.stage = new StageOne();
      gameConfig.registerComponentsWithStage();
      this.threeJsRenderDiv.innerHTML = "";
      this.threeJsRenderDiv.appendChild( this.stage.rendererDomElement);
    },
    //game config should send this.
    [ec.game.gameEnded]({resultMessage, didPlayerWin}){
      this.stage.destroy();
      this.gameConfig.destroy();
    }
  }

  destroy(){
    signal.unregisterSignals(this);
    if(this.stage){
      this.stage.destroy();
    }

  }
}

// function createAudio({src}={}){
//   let audio = new Audio();
//   audio.src = src;
//   //audio.play();
//   return audio;
// }