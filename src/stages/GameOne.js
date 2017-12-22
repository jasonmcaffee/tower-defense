import {signal, eventConfig as ec, generateRandomNumber as grn} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';
import Cursor from 'components/Cursor';
import Earth from 'components/Earth';
import Galaxy from 'components/Galaxy';
import AsteroidMine from 'components/AsteroidMine'
import SunLight from 'components/SunLight';

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
      signal.trigger(ec.game.gameEnded, {resultMessage:"Oh no! There is no hope for the galaxy now :(", didPlayerWin:false});
      this.enemies = [];
    },
    [ec.enemy.died]({componentId}){
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        signal.trigger(ec.game.gameEnded, {resultMessage:"YOU HAVE DEFEATED HER!!!!.  THE GALAXY IS SAVED!!!!", didPlayerWin:true});
      }
    },
    [ec.earth.died]({enemies=this.enemies}={}){
      enemies.forEach(e=>{
        signal.trigger(ec.stage.destroyComponent, {componentId: e.componentId});
      });
    },
    [ec.earth.doneExploding](){
      signal.trigger(ec.game.gameEnded, {resultMessage:"All those you loved are now dead.", didPlayerWin:false});
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
    //tell the camera where to look
    signal.trigger(ec.controls.reset, {lat:-40, lon:-40});

    // children.push(new RotatingBox());
    let min = -290;
    let max = 290;
    for(let i=0; i < 3000; ++i){
      let component = new AsteroidMine({ rotationEnabled:true, x:grn({min, max}), y:grn({min, max}), z:grn({min, max})});
      signal.trigger(ec.stage.addComponent, {component});
    }
    let component = new Floor({numberOfLines:0, distanceBetweenLines:100});
    signal.trigger(ec.stage.addComponent, {component});

    this.addEnemyAndRegisterWithStage(new TysonsMom({hitPoints:100, x:5.3, y: 56, z:8.6}));
    // this.addEnemyAndRegisterWithStage(new TysonsMom({hitPoints:100}));
    // this.addEnemyAndRegisterWithStage(new TysonsMom({hitPoints:100}));
    // this.addEnemyAndRegisterWithStage(new TysonsMom({hitPoints:100}));
    signal.trigger(ec.stage.addComponent, {component: new Player({hitPoints:10, x: -153, y:158, z:40 })});
    signal.trigger(ec.stage.addComponent, {component: new Cursor()});
    signal.trigger(ec.stage.addComponent, {component: new Earth()});
    signal.trigger(ec.stage.addComponent, {component: new Galaxy()});
    signal.trigger(ec.stage.addComponent, {component: new SunLight({x: 100, y:100, z:700})})
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