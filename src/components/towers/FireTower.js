import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Should shoot fire bullets
 */
export default class FireTower {
  componentId = generateUniqueId({name: 'FireTower'}) //needed for hit test ownerId on bullets.
  active = true
  position = {x:0, y:0, z:0}
  hitPoints = 10
  fireIntervalMs = 1000
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, fireIntervalMs=1000} = {}) {
    this.active = active; //whether we are shooting bullets.
    this.position = {x, y, z}; //so we know where bullets fire from.
    this.hitPoints = hitPoints;
    this.fireIntervalMs = fireIntervalMs;
    signal.registerSignals(this);
    this.startFiring();
  }

  signals = {

    //determine if we hit something, or if something hit us.
    [ec.hitTest.hitComponent]({hitComponent, ownerComponentId, damage}) {
      const componentId = hitComponent.componentId;
      //detect if we hit something
      if (this.componentId === componentId) {
        console.log(`fire tower hit ${damage}!!`);
        this.hitPoints -= damage;
      }else if(ownerComponentId === this.componentId){
        console.log(`fire tower hit something.`);
      }
    },
  }

  startFiring(){
    const self = this;
    setInterval(()=>{
      self.fireBullet();
    }, this.fireIntervalMs);
  }

  fireBullet({position=this.position}={}){
    console.log(`fireTower firing from position: `, position);
  }

  destroy(){
    signal.unregisterSignals(this);
  }
}

function createThreejsObjectAndHitbox({componentId, x, y, z}) {
  const material = new MeshNormalMaterial();
  const geometry = new CubeGeometry(2, 2, 2);
  geometry.computeBoundingBox();
  const threejsObject = new Mesh(geometry, material);
  threejsObject.position.set(x, y, z);
  threejsObject.name = componentId;//needed for removing from scene
  const hitBox = new Box3().setFromObject(threejsObject);
  return {threejsObject, hitBox};
}