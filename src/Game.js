
import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';
import GameOne from 'stages/GameOne';

export default class Game{
  constructor({gameConfig=new GameOne(), threeJsRenderDiv}={}){
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