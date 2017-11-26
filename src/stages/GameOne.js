import {signal, eventConfig as ec, generateRandomNumber} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';



export default class GameOne{
  onDestroyFuncs = [] //stuff to run when we destroy.
  enemies = []
  constructor(){
    signal.registerSignals(this);
    this.addDestroy(function(){signal.unregisterSignals(this)});
  }

  signals = {
    [ec.player.died](){
      //let game menu know. let game know so it can destroy the stage.
      signal.trigger(ec.game.gameEnded, {resultMessage:"You Suck", didPlayerWin:false});
    },
    [ec.enemy.died]({componentId}){
      console.log('enemy died. determining if game is over');
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        signal.trigger(ec.game.gameEnded, {resultMessage:"YOU WIN!!!!", didPlayerWin:true});
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
    let min = -90;
    let max = 90;
    let grn = generateRandomNumber;
    for(let i=0; i < 1000; ++i){
      let component = new RotatingBox({x:grn({min, max}), y:grn({min, max}), z:grn({min, max})});
      signal.trigger(ec.stage.addComponent, {component});
    }
    let component = new Floor();
    signal.trigger(ec.stage.addComponent, {component});

    this.addEnemyAndRegisterWithStage(new TysonsMom({hitPoints:1}));

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