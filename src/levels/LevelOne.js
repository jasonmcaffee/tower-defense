import {Vector3, Sphere} from 'three';
import {signal, eventConfig as ec, generateRandomNumber as grn} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import Path from 'components/Path';

import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';
import Cursor from 'components/Cursor';
import Earth from 'components/Earth';
import Galaxy from 'components/Galaxy';
import AsteroidMine from 'components/AsteroidMine'
import SunLight from 'components/SunLight';
import TowerFoundation from 'components/towers/TowerFoundation';
import Enemy from 'components/enemies/Enemy';

export default class LevelOne{
  onDestroyFuncs = [] //stuff to run when we destroy.
  enemies = []
  constructor(){
    signal.registerSignals(this);
    this.addDestroy(function(){signal.unregisterSignals(this)});
  }

  signals = {
    [ec.player.died](){
      //let game menu know. let game know so it can destroy the stage.
      signal.trigger(ec.game.gameEnded, {resultMessage:"You died in agonizing pain.", didPlayerWin:false});
      this.enemies = [];
    },
    [ec.enemy.died]({componentId}){
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        signal.trigger(ec.game.gameEnded, {resultMessage:"YOU HAVE DEFEATED HER!!!!.  THE EARTH IS SAVED!!!!", didPlayerWin:true});
      }
    },
    [ec.earth.died]({enemies=this.enemies}={}){
      enemies.forEach(e=>{
        signal.trigger(ec.stage.destroyComponent, {componentId: e.componentId});
      });
    },
    [ec.earth.doneExploding](){
      signal.trigger(ec.game.gameEnded, {resultMessage:"All those you loved are now dead.", didPlayerWin:false});
    },
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

  registerComponentsWithStage({earthRadius=150}={}){
    //tell the camera where to look
    signal.trigger(ec.controls.reset, {lat:-40, lon:-40});



    const pathVectors = [
      {x: 0, y: 0, z: 0, x2:100, y2:0, z2:0},
      {x: 100, y: 0, z: 0, x2:100, y2:200, z2:0},
      {x: 100, y: 200, z: 0, x2:200, y2:200, z2:0},
    ];

    const towerPositions = [
      {x: 50, y: 50, z: 0},
      {x: 100, y: 0, z: 0},
      {x: 100, y: 200, z: 0},
    ];

    for(let towerPosition of towerPositions){
      signal.trigger(ec.stage.addComponent, {component: new TowerFoundation(towerPosition)});
    }

    signal.trigger(ec.stage.addComponent, {component: new Floor({numberOfLines:1000, distanceBetweenLines:100}) });
    signal.trigger(ec.stage.addComponent, {component: new Path({pathVectors}) });
    signal.trigger(ec.stage.addComponent, {component: new Player({hitPoints:10, x: 100, y:100, z:200 })});
    signal.trigger(ec.stage.addComponent, {component: new Cursor()}); //needed to fire bullets
    // signal.trigger(ec.stage.addComponent, {component: new Earth({radius:earthRadius})});
    // signal.trigger(ec.stage.addComponent, {component: new Galaxy()});
    signal.trigger(ec.stage.addComponent, {component: new SunLight({x: 100, y:100, z:700})});

    signal.trigger(ec.stage.addComponent, {component: new Enemy({pathVectors, towerPositions}) });
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
