import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Enemy - 
 */
export default class Enemy{
  componentId = generateUniqueId({name:'Enemy'})
  threejsObject
  hitBox
  constructor({x=0, y=0, z=0, hitPoints=10, speed=1, fireIntervalMs=1000, firingRange=10, pathVectors=[], towerPositions=[]}={}){
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId});
    this.threejsObject = threejsObject;
    this.hitBox = hitBox;
    this.hitPoints = hitPoints;
    this.speed = speed;
    this.firingRange = firingRange;
    this.fireIntervalMs = fireIntervalMs;
    this.position = {x, y, z};
    this.pathVectors = pathVectors;
    this.towerPositions = towerPositions;
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, damage}){
      const componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      console.log(`enemy hit. ${damage}`);

    }
  }

  render(){
    //todo: move along the path.
    //todo: find closest enemy
  }

  startFiring(){
    const self = this;
    this.fireInterval = setInterval(()=>{
      self.fireBulletAtNearestTower();
    }, this.fireIntervalMs);
  }

  fireBulletAtNearestTower(){

  }
  fireBullet({direction}={}){
    console.log(`Enemy firing bullet in direction: `, direction);
  }
  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }
}

function createThreejsObjectAndHitbox({componentId, x, y, z}){
  const material = new MeshNormalMaterial();
  const geometry = new CubeGeometry(2, 2, 2);
  geometry.computeBoundingBox();
  const threejsObject = new Mesh(geometry, material);
  threejsObject.position.set(x, y, z);
  threejsObject.name = componentId;//needed for removing from scene
  const hitBox = new Box3().setFromObject(threejsObject);
  return {threejsObject, hitBox};
}