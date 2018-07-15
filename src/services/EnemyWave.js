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
      console.log(`EnemyWave enemy.died : ${componentId}`);
      this.removeEnemy({componentId});
      if(this.haveAllEnemiesBeenCreatedAndKilled()){
        console.log(`EnemyWave ${this.name} has no more enemies to create or wait for to die.`);
        this.endWave();
      }
    },
    // [ec.enemy.reachedEndOfPath]({componentId}){
    //   console.log(`enemy.reachedEndOfPath: ${componentId}`);
    //   this.removeEnemy({componentId});
    //   if(this.haveAllEnemiesBeenCreated()){
    //     this.endWave();
    //   }
    // },
  }

  beginWave(){
    this.createEnemies();
    signal.trigger(ec.enemyWave.waveBegan, {waveName: this.name});
  }

  haveAllEnemiesBeenCreated({createdEnemyCount=this.createdEnemyCount, enemyCount=this.enemyCount}={}){
    const allCreated =  createdEnemyCount >= enemyCount;
    return allCreated;
  }

  haveAllEnemiesBeenCreatedAndKilled({enemies=this.enemies}={}){
    const allCreated = this.haveAllEnemiesBeenCreated();
    const result = allCreated && enemies.length === 0;
    console.log(`EnemyWave allCreatedAndKilled: ${result}  allCreated: ${allCreated}`);
    return result;
  }

  //called when all enemies die
  endWave({didPlayerWin=true, resultMessage="wave complete"}={}){
    this.destroy();
    signal.trigger(ec.enemyWave.waveEnded, {resultMessage, didPlayerWin, waveName: this.name});
  }

  createEnemies({enemyCount=this.enemyCount, enemyConfig=this.enemyConfig, startEnemyIntervalMs=this.startEnemyIntervalMs}={}){
    //create the first enemy immediately so enemy dieing on previous wave doesn't end us.
    this.createdEnemyCount = 1;

    this.startEnemyIntervalId = setInterval(()=>{
      if(this.createdEnemyCount++ > enemyCount){
        clearInterval(this.startEnemyIntervalId);
        return;
      }
      console.log(`EnemyWave ${this.name} creating enemy ${this.createdEnemyCount}`);
      const enemy = new Enemy(enemyConfig);
      this.enemies.push(enemy);
      signal.trigger(ec.stage.addComponent, {component: enemy});
    }, startEnemyIntervalMs);
  }

  //called on when enemy dies
  removeEnemy({componentId, enemies=this.enemies}={}){
    let index = enemies.findIndex(e=>e.componentId === componentId);
    if(index < 0){return;}
    enemies.splice(index, 1);
  }

  destroy({enemies=this.enemies}={}){
    clearInterval(this.startEnemyIntervalId);
    signal.unregisterSignals(this);
    enemies.forEach(e=>{
      signal.trigger(ec.stage.destroyComponent, {componentId: e.componentId});
    });
  }
}