import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * BaseTower -
 */
export default class BaseTower {
  componentId = generateUniqueId({name: 'BaseTower'})
  threejsObject
  hitBox

  constructor({x = 0, y = 0, z = 0} = {}) {
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId});
    this.threejsObject = threejsObject;
    this.hitBox = hitBox;
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, damage}) {
      const componentId = hitComponent.componentId;
      if (this.componentId !== componentId) { return; }
    },
  }

  render() {

  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component: this});
  }

  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name = this.threejsObject.name, componentId = this.componentId}) {
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
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