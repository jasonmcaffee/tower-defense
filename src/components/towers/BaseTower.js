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
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, firingRange=100, fireIntervalMs=1000, cost=1, sellPercentage= 0.8, upgradePercentage= 1.5, enemies=[], hitExclusionComponentIds=[]} = {}) {
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
    signal.registerSignals(this);
    this.startFiring();
  }

  signals = {

    //determine if we hit something, or if something hit us.
    [ec.hitTest.hitComponent]({hitComponent, ownerComponentId, damage}) {
      const componentId = hitComponent.componentId;
      //detect if we hit something
      if (this.componentId === componentId) {
        console.log(`fire tower was hit ${damage}!!`);
        this.hitPoints -= damage;
      }else if(ownerComponentId === this.componentId){
        console.log(`fire tower hit something.`);
      }
    },

    [ec.enemy.spawned]({componentId, x, y, z}){
      this.enemies.push({componentId, x, y, z});
    },
    [ec.enemy.died]({componentId}){
      this.removeEnemy({componentId});
    },
    [ec.enemy.positionChanged]({componentId, x, y, z}){
      let enemy = this.enemies.find(e=>e.componentId === componentId);
      if(!enemy){
        console.log(`BaseTower couldn't find enemy, so automatically added componentId:${componentId}`);
        enemy = {componentId, x, y, z};
        this.enemies.push({componentId, x, y, z});
      }
      enemy.x = x;
      enemy.y = y;
      enemy.z = z;
    },
  }

  //called on when enemy dies
  removeEnemy({componentId}={}){
    let index = this.enemies.findIndex(e=>e.componentId === componentId);
    console.log(`BaseTower removeEnemy: ${componentId} index: ${index}  enemies: `, this.enemies);
    if(index < 0){return;}
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

  fireBullet({startPosition=this.position, hitExclusionComponentIds=this.hitExclusionComponentIds, ownerComponentId=this.componentId}={}){
    const {nearestEnemyPosition, nearestComponentId, distance, direction} = this.getNearestEnemyPositionAndDirection();
    console.log(`fireBullet potentially at: `, direction, distance, nearestComponentId);
    if(distance > this.firingRange){
      console.log(`BaseTower has an enemy distance: ${distance} that is outside of the range: ${this.firingRange}`);
      return;
    }

    let bullet = new Bullet({direction, startPosition, hitExclusionComponentIds, ownerComponentId, playSound: false, distancePerSecond:3000});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  getNearestEnemyPositionAndDirection({targets=this.enemies, startPosition=new Vector3(this.position.x, this.position.y, this.position.z)}={}){
    if(targets.length <= 0){
      console.log(`BaseTower has no enemies to shoot at`);
      return;
    }

    let nearestEnemyPosition = new Vector3(0, 0, 0);
    let shortestDistance;
    let nearestComponentId;
    let shortestDirection;
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
      }

      if(distance < shortestDistance){
        shortestDistance = distance;
        shortestDirection = direction;
        nearestEnemyPosition = targetVector;
        nearestComponentId = target.componentId;
      }

    }
    return {nearestEnemyPosition, nearestComponentId, distance: shortestDistance, direction: shortestDirection};

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