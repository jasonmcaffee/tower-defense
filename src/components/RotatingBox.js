import {BoxGeometry, CubeGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh} from 'three';
import {signal, eventConfig as ec, generateUniqueId} from "core/core";

let material = new MeshNormalMaterial();
let standardGeomatry = new CubeGeometry(.2, .2, .2);
standardGeomatry.computeBoundingBox();

export default class RotatingBox{
  componentId = generateUniqueId({name:'RotatingBox'})

  constructor({x=0, y=0, z=0}={}){
    let geometry = standardGeomatry;
    this.threejsObject = new Mesh(geometry, material);
    this.threejsObject.position.set(x, y, z);
    this.threejsObject.name = this.componentId;//needed for removing from scene
    signal.registerSignals(this);
  }
  signals = {
    [ec.hitTest.hitComponent]({componentId, distance, point, face, faceIndex, indices, object, scene}){
      if(this.componentId !== componentId){return;}
      this.destroy({scene});
    }
  }
  render() {
    this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.02;
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    let {componentId, threejsObject} = this;
    signal.trigger(ec.hitTest.registerHittableComponent, {componentId, threejsObject});
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    //console.log(`destroy called for: ${name}`);
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.stage.componentDestroyed, {componentId});
  }

}