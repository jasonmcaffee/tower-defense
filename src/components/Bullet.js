import {Geometry, LineBasicMaterial, Line, Vector3} from 'three';
import {generateUniqueId} from "core/core";

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    blueMaterial: new LineBasicMaterial({color:0x4286f4}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af}),
  }
};

export default class Bullet{
  componentId = generateUniqueId({name:'Bullet'})

  constructor({x=0, y=0, z=0, x2=0, y2=0, z2=0}={}){
    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});
  }

  render() {
    // this.threejsObject.rotation.x += 0.01;
    // this.threejsObject.rotation.y += 0.02;
  }

  createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0, material=style.material.blueMaterial}={}){
    let geometry = new Geometry();
    geometry.vertices.push(new Vector3(x, y, z));
    geometry.vertices.push(new Vector3(x2, y2, z2));
    let line = new Line(geometry, material);
    line.name = generateUniqueId({name:'line'});
    return line;
  }
  addToScene({scene}) {
    scene.add(this.threejsObject);
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
  }

}