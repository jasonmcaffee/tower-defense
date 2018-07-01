import {LineBasicMaterial, Vector3, Geometry, Line, AmbientLight} from 'three';
import {generateUniqueId} from "core/core";

const style ={
  material:{
    blueMaterial: new LineBasicMaterial({color:0xf44842}),
  },
};

export default class Path{
  constructor({pathVectors=[]}={}){
    this.lines = pathVectors.map(pv=>createLine(pv));
  }

  render(){

  }

  addToScene({scene}){
    console.log(`Path addToScene called`);
    this.addLinesToScene({scene});
  }

  addLinesToScene({lines = this.lines, scene}){
    console.log(`path adding lines to scene: `, lines);
    lines.forEach(l => scene.add(l));
  }
}


function createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0, material=style.material.blueMaterial}={}){
  let geometry = new Geometry();
  geometry.vertices.push(new Vector3(x, y, z));
  geometry.vertices.push(new Vector3(x2, y2, z2));
  let line = new Line(geometry, material);
  line.name = generateUniqueId({name:'line'});
  return line;
}