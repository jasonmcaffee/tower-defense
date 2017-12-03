import {signal, eventConfig as ec, generateRandomNumber as grn} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';



export default class GameTwo{
  onDestroyFuncs = [] //stuff to run when we destroy.
  enemies = []
  constructor(){
    signal.registerSignals(this);
    this.addDestroy(function(){signal.unregisterSignals(this)});
  }

  signals = {
    [ec.player.died](){
      //let game menu know. let game know so it can destroy the stage.
      signal.trigger(ec.game.gameEnded, {resultMessage:"Oh no! There is no hope for the galaxy now :(", didPlayerWin:false});
      this.enemies = [];
    },
    [ec.enemy.died]({componentId}){
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        signal.trigger(ec.game.gameEnded, {resultMessage:"YOU HAVE DEFEATED HER!!!!.  THE GALAXY IS SAVED!!!!", didPlayerWin:true});
      }
    }
  }

  removeEnemy({componentId, enemies=this.enemies}={}){
    let index = enemies.findIndex(e=>e.componentId == componentId);
    if(index < 0){return;}
    enemies.splice(index, 1);
  }

  addEnemyAndRegisterWithStage(enemy){
    this.enemies.push(enemy);
    signal.trigger(ec.stage.addComponent, {component: enemy});
  }

  registerComponentsWithStage(){
    // children.push(new RotatingBox());
    let min = -190;
    let max = 190;
    for(let i=0; i < 1000; ++i){
      let component = new RotatingBox({x:grn({min, max}), y:grn({min, max}), z:grn({min, max})});
      signal.trigger(ec.stage.addComponent, {component});
    }
    let component = new Floor();
    signal.trigger(ec.stage.addComponent, {component});

    signal.trigger(ec.stage.addComponent, {component: new Player({hitPoints:10, x: 0, y:0, z:0 })});
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
    this.enemies = [];
  }
}