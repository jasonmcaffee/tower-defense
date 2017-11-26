
import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';
import {stageOneConfig} from "stages/stageOneConfig";

export default class Game{
  constructor({stageConfig=stageOneConfig, threeJsRenderDiv}={}){
    this.stageConfig = stageConfig;
    this.threeJsRenderDiv = threeJsRenderDiv;

    signal.registerSignals(this);
  }

  signals = {
    [ec.game.startGame]({stageConfig=this.stageConfig}={}){
      if(this.stage){
        this.stage.destroy();
      }
      this.stage = new StageOne({stageConfig});
      this.threeJsRenderDiv.innerHTML = "";
      this.threeJsRenderDiv.appendChild( this.stage.rendererDomElement);
    },
    [ec.player.died](){
      this.stage.destroy();
      signal.trigger(ec.game.gameEnded, {resultMessage:"You Suck", didPlayerWin:false});
    }
  }

  destroy(){
    signal.unregisterSignals(this);
    if(this.stage){
      this.stage.destroy();
    }

  }
}