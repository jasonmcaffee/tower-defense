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
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10} = {}) {
    this.active = active; //whether we are shooting bullets.
    this.position = {x, y, z}; //so we know where bullets fire from.
    this.hitPoints = hitPoints;
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, ownerComponentId, damage}) {
      const componentId = hitComponent.componentId;
      //detect if we hit something
      if (this.componentId !== componentId) {
        if(ownerComponentId != this.componentId){return;}
        console.log(`fire tower hit something.`);
        return;
      }else{
        console.log(`fire tower hit ${damage}!!`);
        this.hitPoints -= damage;
      }
    },
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