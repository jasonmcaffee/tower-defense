import {signal, eventConfig as ec, generateRandomNumber as grn} from "core/core";
import Enemy from 'components/enemies/Enemy';

export default class EnemyWave{
  constructor({x=0, y=0, z=0, pathVectors=[], towerPositions=[], enemyCount=5, startEnemyIntervalMs=500, name='', enemyConfig={}}){
    this.pathVectors = pathVectors;
    this.towerPositions = towerPositions;
    this.enemyCount = enemyCount;
    this.startEnemyIntervalMs = startEnemyIntervalMs;
    this.position = {x, y, z};
    this.enemies = [];
    this.name = name;
    this.enemyConfig = {x, y, z, towerPositions, pathVectors, ...enemyConfig};
    signal.registerSignals(this);
  }

  signals = {
    [ec.enemyWave.beginWave]({waveName}){
      if(waveName !== this.name){return;}
      console.log(`EnemyWave beginWave called for ${waveName}`);
      this.beginWave();
    },
    [ec.enemy.died]({componentId}){
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        this.endWave();
      }
    },
    [ec.enemy.reachedEndOfPath]({componentId}){
      console.log(`enemy.reachedEndOfPath: ${componentId}`);
      this.removeEnemy({componentId});
      if(this.enemies.length <= 0){
        this.endWave();
      }
    },
  }

  beginWave(){
    this.createEnemies();
    signal.trigger(ec.enemyWave.waveBegan, {});
  }

  //called when all enemies die
  endWave({didPlayerWin=true, resultMessage="wave complete"}={}){
    clearInterval(this.startEnemyIntervalId);
    this.destroy();
    signal.trigger(ec.enemyWave.waveEnded, {resultMessage, didPlayerWin});
  }

  createEnemies({enemyCount=this.enemyCount, enemyConfig=this.enemyConfig, startEnemyIntervalMs=this.startEnemyIntervalMs}={}){
    let createdEnemyCount = 1;
    this.startEnemyIntervalId = setInterval(()=>{
      if(createdEnemyCount++ > enemyCount){
        clearInterval(this.startEnemyIntervalId);
        return;
      }
      console.log(`EnemyWave creating enemy ${createdEnemyCount}`);
      const enemy = new Enemy(enemyConfig);
      this.enemies.push(enemy);
      signal.trigger(ec.stage.addComponent, {component: enemy});
    }, startEnemyIntervalMs);
  }

  //called on when enemy dies
  removeEnemy({componentId, enemies=this.enemies}={}){
    let index = enemies.findIndex(e=>e.componentId == componentId);
    if(index < 0){return;}
    enemies.splice(index, 1);
  }

  destroy({enemies=this.enemies}={}){
    signal.unregisterSignals(this);
    enemies.forEach(e=>{
      signal.trigger(ec.stage.destroyComponent, {componentId: e.componentId});
    });
  }
}