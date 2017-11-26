import {signal, eventConfig as ec, generateRandomNumber} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';



export default class GameOne{
  onDestroyFuncs = [] //stuff to run when we destroy.
  constructor(){
    signal.registerSignals(this);
    this.addDestroy(function(){signal.unregisterSignals(this)});
  }

  signals = {
    [ec.player.died](){
      //let game menu know. let game know so it can destroy the stage.
      signal.trigger(ec.game.gameEnded, {resultMessage:"You Suck", didPlayerWin:false});
    }
  }

  registerComponentsWithStage(){
    // children.push(new RotatingBox());
    let min = -90;
    let max = 90;
    let grn = generateRandomNumber;
    for(let i=0; i < 1000; ++i){
      let component = new RotatingBox({x:grn({min, max}), y:grn({min, max}), z:grn({min, max})});
      signal.trigger(ec.stage.addComponent, {component});
    }
    signal.trigger(ec.stage.addComponent, {component: new Floor()});
    signal.trigger(ec.stage.addComponent, {component: new TysonsMom()});

    signal.trigger(ec.stage.addComponent, {component: new Player()});
  }


  addDestroy(func){
    func.bind(this);
    this.onDestroyFuncs.push(func);
  }
  runDestroyFuncs({onDestroyFuncs=this.onDestroyFuncs}={}){
    onDestroyFuncs.forEach(f=>f());
  }
  destroy(){
    this.runDestroyFuncs();
  }
}