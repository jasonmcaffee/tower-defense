import {BoxGeometry, CubeGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3} from 'three';
import {signal, eventConfig as ec, generateUniqueId} from "core/core";

let material = new MeshNormalMaterial();
let standardGeomatry = new CubeGeometry(.2, .2, .2);
standardGeomatry.computeBoundingBox();

export default class Player {
  componentId = generateUniqueId({name: 'Player'})
  hitBox //used to determine if something hit us
  hitPoints
  constructor({x = 0, y = 0, z = 0, hitPoints=100} = {}) {
    let geometry = standardGeomatry;
    this.hitPoints = hitPoints;
    this.threejsObject = new Mesh(geometry);
    this.threejsObject.position.set(x, y, z);
    this.threejsObject.name = this.componentId;//needed for removing from scene
    this.hitBox = new Box3().setFromObject(this.threejsObject);
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, damage}) {
      let componentId = hitComponent.componentId;
      if (this.componentId !== componentId) {
        return;
      }
      this.hitPoints -= damage;
      if(this.hitPoints <= 0){
        signal.trigger(ec.stage.destroyComponent, {componentId});
      }
    },
    [ec.camera.positionChanged]({x, y, z}){
      // this.threejsObject.position.set(x, y, z);
      // this.hitBox = new Box3().setFromObject(this.threejsObject);
      // signal.trigger(ec.player.positionChanged, {x, y, z});//let enemy know where you arez
    }
  }

  render() {
    this.hitBox = new Box3().setFromObject(this.threejsObject); //allow for moving box
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    //signal.trigger(ec.hitTest.registerHittableComponent, {component: this});
  }

  destroy({scene, name = this.threejsObject.name, componentId = this.componentId}) {
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }

}