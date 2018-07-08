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
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, fireIntervalMs=1000, cost=1, sellPercentage= 0.8, upgradePercentage= 1.5} = {}) {
    this.active = active; //whether we are shooting bullets.
    this.position = {x, y, z}; //so we know where bullets fire from.
    this.hitPoints = hitPoints;
    this.fireIntervalMs = fireIntervalMs;
    const {threejsObject} = this.createThreejsObject({componentId: this.componentId, x, y, z});
    this.threejsObject = threejsObject;
    this.cost = cost;
    this.sellPercentage = sellPercentage;
    this.upgradePercentage = upgradePercentage;
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

  fireBullet({startPosition=this.position, hitExclusionComponentId=this.componentId, ownerComponentId=this.componentId}={}){
    const enemyPosition = this.getNearestEnemyPosition();
    const direction ={};


    let bullet = new Bullet({direction, startPosition, hitExclusionComponentId, ownerComponentId, playSound: false, distancePerSecond:3000});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  getNearestEnemyPosition(){

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