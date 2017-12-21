import {PointLight} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

const styles = {
  color: {
    white: 0xffffff,
  }
}

export default class SunLight{
  componentId = generateUniqueId({name:'SunLight'})
  hitBox //used to determine if something hit us
  rotationEnabled = false
  constructor({x=0, y=0, z=0, color=styles.color.white, intensity=5, distance=1200, decay=2}={}){

    this.threejsObject = new PointLight(color, intensity, distance, decay);
    this.threejsObject.position.set(x, y, z);
    this.threejsObject.name = this.componentId;//needed for removing from scene
  }
  render() {
  }
  addToScene({scene}) {
    scene.add(this.threejsObject);
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
  }

}