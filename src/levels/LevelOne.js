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
import EnemyWave from 'services/EnemyWave';



const pathVectors = [
  {x: 0, y: 0, z: 0, x2:100, y2:0, z2:0},
  {x: 100, y: 0, z: 0, x2:100, y2:200, z2:0},
  {x: 100, y: 200, z: 0, x2:200, y2:200, z2:0},
];

const towerPositions = [
  {x: 125, y: 175, z: 0},
  {x: 75, y: 25, z: 0},
];

const enemyWavesConfig = [
  {
    name: 'Wave 1', x: 0, y: 0, z: 0, enemyCount: 1, startEnemyIntervalMs: 500, towerPositions, pathVectors,
    enemyConfig: {moveDistancePerSecond: 58, fireIntervalMs: 1000, firingRange: 10, hitPoints: 1, damage: 1,},
  },
  {
    name: 'Wave 2', x: 0, y: 0, z: 0, enemyCount: 15, startEnemyIntervalMs: 500, towerPositions, pathVectors,
    enemyConfig: {moveDistancePerSecond: 9, fireIntervalMs: 1000, firingRange: 10, hitPoints: 2, damage: 1, },
  },
];

/**
 * Coordinates EnemyWaves, tower positions, paths
 */
export default class LevelOne{
  onDestroyFuncs = [] //stuff to run when we destroy.
  constructor({currentWaveIndex=0, name='Level One'}={}){
    this.currentWaveIndex = currentWaveIndex;
    this.name = name;
    this.components = [];//so we can unregister when level is completed.
    signal.registerSignals(this);
    this.addDestroy(function(){signal.unregisterSignals(this)});
  }

  signals = {
    [ec.player.died](){
      //let game menu know. let game know so it can destroy the stage.
      signal.trigger(ec.game.gameEnded, {resultMessage:"You died in agonizing pain.", didPlayerWin:false});
    },
    [ec.enemyWave.waveEnded]({resultMessage, didPlayerWin, waveName}){
      console.log(`wave ended: ${waveName}`);
      this.currentWaveIndex++;
      this.startNextWave();
    },

  }

  startNextWave(){
    if(this.currentWaveIndex >= enemyWavesConfig.length){
      console.log(`no more waves for level`);
      this.completeLevel();
      return;
    }
    console.log(`starting next wave`);
    const enemyWaveConfig = enemyWavesConfig[this.currentWaveIndex]; //todo: track waves ending.
    const enemyWave = new EnemyWave(enemyWaveConfig);
    signal.trigger(ec.enemyWave.beginWave, {waveName: enemyWaveConfig.name});
  }

  completeLevel(){
    // this.destroy();
    // signal.trigger(ec.level.completed, {levelName: this.name});
  }

  registerComponentsWithStage({}={}){
    //tell the camera where to look
    signal.trigger(ec.controls.reset, {lat:-40, lon:-40});

    for(let towerPosition of towerPositions){
      this.addComponent({component: new TowerFoundation(towerPosition)});
    }

    this.addComponent({component: new Floor({numberOfLines:1000, distanceBetweenLines:100}) });
    this.addComponent({component: new Path({pathVectors}) });
    this.addComponent({component: new Cursor()}); //needed to fire bullets
    this.addComponent({component: new Player({hitPoints:10, x: 100, y:100, z:200 })});
    this.addComponent({component: new SunLight({x: 100, y:100, z:700})});

    //enemies
    this.startNextWave();
  }

  addComponent({component}){
    this.components.push(component);
    signal.trigger(ec.stage.addComponent, {component});
  }

  addDestroy(func){
    func.bind(this);
    this.onDestroyFuncs.push(func);
  }
  runDestroyFuncs({onDestroyFuncs=this.onDestroyFuncs}={}){
    onDestroyFuncs.forEach(f=>f());
  }
  destroy(){
    this.components.forEach(component=>signal.trigger(ec.stage.destroyComponent, component));
    this.runDestroyFuncs();
    this.components = [];
  }
}
