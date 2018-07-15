import {LineSegments, LineBasicMaterial, EdgesGeometry, TetrahedronGeometry, MeshNormalMaterial, MeshBasicMaterial, Mesh, Box3, Vector3, Texture, Object3D, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';

/**
 * Should shoot fire bullets
 */
export default class BaseTower {
  componentId = generateUniqueId({name: 'BaseTower'}) //needed for hit test ownerId on bullets.
  threejsObject //used by TowerFoundation to display
  level = 1
  maxLevel = 10
  upgradeCost = 10
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, damage=1, firingRange=100, fireIntervalMs=1000, cost=1, sellPercentage= 0.8, upgradePercentage= 1.5, enemies=[], hitExclusionComponentIds=[], bulletDistancePerSecond=300} = {}) {
    this.active = active; //whether we are shooting bullets.
    this.position = {x, y, z}; //so we know where bullets fire from.
    this.hitPoints = hitPoints;
    this.fireIntervalMs = fireIntervalMs;
    const {threejsObject} = this.createThreejsObject({componentId: this.componentId, x, y, z});
    this.threejsObject = threejsObject;
    this.cost = cost;
    this.sellPercentage = sellPercentage;
    this.upgradePercentage = upgradePercentage;
    this.enemies = enemies;
    this.firingRange = firingRange;
    this.hitExclusionComponentIds = hitExclusionComponentIds; //so we dont hit TowerFoundation
    this.bulletDistancePerSecond = bulletDistancePerSecond;
    this.damage = 1;
    signal.registerSignals(this);
    this.startFiring();
  }

  signals = {

    //determine if we hit something, or if something hit us.
    [ec.hitTest.hitComponent]({hitComponent, ownerComponentId, damage}) {
      const componentId = hitComponent.componentId;
      //detect if we hit something
      if (this.componentId === componentId) {
        console.log(`BaseTower was hit ${damage}!!`);
        this.hitPoints -= damage;
      }else if(ownerComponentId === this.componentId){
        console.log(`BaseTower hit something.`);
      }
    },

    // [ec.enemy.spawned]({componentId, x, y, z}){
    //   this.enemies.push({componentId, x, y, z});
    // },
    [ec.enemy.died]({componentId}={}){
      console.log(`BaseTower ENEMY DIED ========================`);
      this.removeEnemy({componentId});
    },

    //delta is in seconds
    [ec.enemy.positionChanged]({componentId, x, y, z}){
      let enemy = this.enemies.find(e=>e.componentId === componentId);
      const positionTime = Date.now();
      if(!enemy){
        console.log(`BaseTower couldn't find enemy, so automatically added componentId:${componentId}`);
        enemy = {componentId, x, y, z, positionTime};
        this.enemies.push({componentId, x, y, z});
        console.log(`BaseTower enemies is now: `, this.enemies);
      }else{
        enemy.previousPosition = {x: enemy.x, y: enemy.y, z: enemy.z}; //so we can predict the next position.
        enemy.previousPositionTime = enemy.positionTime;
        enemy.positionTime = positionTime;
        enemy.x = x;
        enemy.y = y;
        enemy.z = z;
      }
    },
  }

  //called on when enemy dies
  removeEnemy({componentId}={}){
    console.log(`BaseTower attempting to remove componentId: ${componentId}`);
    let index = this.enemies.findIndex(e=>e.componentId === componentId);
    console.log(`BaseTower enemy index is ${index}`);
    if(index < 0){return;}
    console.log(`BaseTower removeEnemy: ${componentId} index: ${index}  enemies: `, this.enemies);
    this.enemies.splice(index, 1);
    console.log(`BasedTower enemies is now: `, this.enemies);
  }

  isUpgradable({level=this.level, maxLevel=this.maxLevel}={}){
    return level < maxLevel;
  }

  getUpgradeInfo(){
    return {
      isUpgradable: this.isUpgradable(),
      upgradeCost: this.cost * this.level * this.upgradePercentage,
      level: this.level,
      sellValue: this.cost * this.sellPercentage,
    };
  }

  //called on by TowerFoundation
  upgrade(){
    this.level++;//todo: fireinterval, bullet damage, etc
  }

  startFiring(){
    const self = this;
    this.fireBulletIntervalId = setInterval(()=>{
      self.fireBullet();
    }, this.fireIntervalMs);
  }

  //each child tower should implement this themselves
  fireBullet({startPosition=this.position, hitExclusionComponentIds=this.hitExclusionComponentIds, ownerComponentId=this.componentId}={}){
    console.warn(`tower attempting to fire bullet without it's own fireBullet implementation.`);
    // const {nearestEnemyPosition, nearestComponentId, distance, direction} = this.getNearestEnemyPositionAndDirection();
    // console.log(`fireBullet potentially at: `, direction, distance, nearestComponentId);
    // if(distance > this.firingRange){
    //   console.log(`BaseTower has an enemy distance: ${distance} that is outside of the range: ${this.firingRange}`);
    //   return;
    // }
    //
    // let bullet = new Bullet({direction, startPosition, hitExclusionComponentIds, ownerComponentId, playSound: false, distancePerSecond:3000});
    // signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  /**
   * TODO: predict enemies next position so bullet hits them
   * TODO: nearest enemy shouldn't always be the target. should be enemy with least distance to end of path.
   * @param targets
   * @param startPosition
   * @returns {{nearestEnemyPosition: Vector3, nearestComponentId: *, distance: *, direction: *}}
   */
  getNearestEnemyPositionAndDirection({targets=this.enemies, startPosition=new Vector3(this.position.x, this.position.y, this.position.z)}={}){
    if(targets.length <= 0){
      console.log(`BaseTower has no enemies to shoot at`);
      return;
    }

    let nearestEnemyPosition = new Vector3(0, 0, 0);
    let shortestDistance;
    let nearestComponentId;
    let shortestDirection;
    let nearestTarget;
    for(let i=0, len=targets.length; i < len; ++i){
      let target = targets[i];
      let targetVector = new Vector3(target.x, target.y, target.z);
      let distance = startPosition.distanceTo(targetVector);
      let direction = new Vector3();
      direction.subVectors(targetVector, startPosition);

      if(!shortestDistance){
        shortestDistance = distance;
        nearestEnemyPosition = targetVector;
        nearestComponentId = target.componentId;
        shortestDirection = direction;
        nearestTarget = target;
      }

      if(distance < shortestDistance){
        shortestDistance = distance;
        shortestDirection = direction;
        nearestEnemyPosition = targetVector;
        nearestComponentId = target.componentId;
        nearestTarget = target;
      }
    }
    const nearestEnemyPreviousPosition = nearestTarget.previousPosition;
    return {nearestEnemy: nearestTarget, nearestEnemyPosition, nearestEnemyPreviousPosition, nearestComponentId, distance: shortestDistance, direction: shortestDirection};
  }



  createThreejsObject({componentId, x, y, z, size=7, displayWireframe=true}){
    const material = new MeshNormalMaterial();
    // const geometry = new CubeGeometry(size, size, size);
    const geometry = new TetrahedronGeometry(size, 2);
    geometry.computeBoundingBox();
    const threejsObject = new Mesh(geometry, material);
    threejsObject.position.set(x, y, z);
    threejsObject.name = componentId;//needed for removing from scene

    if(displayWireframe){
      // wireframe
      const geo = new EdgesGeometry( geometry ); // or WireframeGeometry
      const mat = new LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
      const wireframe = new LineSegments( geo, mat );
      threejsObject.add( wireframe );
    }
    return {threejsObject};
  }


  //called on by tower foundation
  destroy({scene, name=this.threejsObject.name}){
    console.log(`FireTower destroy called`);
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.unregisterSignals(this);
    clearInterval(this.fireBulletIntervalId);
  }
}




// USE TRACKING MISSLES INSTEAD FOR NOW
// //need to figure out how to factor in bullet speed. secondsFromNow probably not right...
// determinePositionEnemyWillBeInNTime({bulletDistancePerSecond, secondsFromNow, enemy, startPosition=new Vector3(this.position.x, this.position.y, this.position.z)}){
//   const {previousPosition, previousPositionTime, positionTime, x, y, z} = enemy;
//   if(!previousPosition || !previousPositionTime){
//     console.log(`enemy doesn't have a previous position, so cant determine where it will be`);
//     return;
//   }
//
//
//   const previousPositionVector = new Vector3(previousPosition.x, previousPosition.y, previousPosition.z);
//   const positionVector = new Vector3(x, y, z);
//
//   //determine the direction the enemy is travelling.
//   const direction = new Vector3();
//   direction.subVectors(positionVector, previousPositionVector);
//
//   //determine the distance the enemy will have travelled in secondsFromNow
//   const deltaMilliseconds = positionTime - previousPositionTime;
//   const deltaSeconds = deltaMilliseconds / 1000;
//   const distanceEnemyTravelled = previousPositionVector.distanceTo(positionVector);
//   const distanceEnemyWillTravelInTime = distanceEnemyTravelled * secondsFromNow / deltaSeconds;
//
//   //determine position enemy will be at in secondsFromNow
//   const p = new Vector3().copy(direction).normalize().multiplyScalar(distanceEnemyWillTravelInTime);
//   positionVector.add(p);
//
//   const directionToEnemyInNSeconds = new Vector3();
//   directionToEnemyInNSeconds.subVectors(positionVector, startPosition);
//
//   const distance = startPosition.distanceTo(positionVector);
//
//   return {positionVector, directionVector: directionToEnemyInNSeconds, distance};
// }