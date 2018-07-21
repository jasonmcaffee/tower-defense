import {LineBasicMaterial, Vector3, Geometry, Line, AmbientLight} from 'three';
import {generateUniqueId, signal, eventConfig as ec} from "core/core";
import PathPoint from 'components/Path/PathPoint';

const style ={
  material:{
    blueMaterial: new LineBasicMaterial({color:0xf44842}),
  },
};

export default class Path{
  componentId = generateUniqueId({name: 'Path'})
  constructor({pathVectors=[], pathPointSize=1}={}){
    this.lines = pathVectors.map(pv=>createLine(pv));
    this.pathPoints = pathVectors.map(pv=>createPathPoint({...pv, size: pathPointSize}));
  }

  render(){

  }

  addToScene({scene}){
    console.log(`Path addToScene called`);
    this.addLinesToScene({scene});
    this.addPathPointsToScene({scene});
  }

  addLinesToScene({lines = this.lines, scene}){
    console.log(`path adding lines to scene: `, lines);
    lines.forEach(l => scene.add(l));
  }

  addPathPointsToScene({pathPoints=this.pathPoints, scene}){
    // pathPoints.forEach(p=>scene.add(p));
    pathPoints.forEach(p=> signal.trigger(ec.stage.addComponent, {component: p}));
  }
  destroy({scene}){
    this.lines.forEach(l => {
      let object3d = scene.getObjectByName(l.name);
      scene.remove(object3d);
    });
  }
}

function createPathPoint({x2=0, y2=0, z2=0, size}){
  const pathPoint = new PathPoint({x:x2, y:y2, z:z2, size});
  return pathPoint;
}

function createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0, material=style.material.blueMaterial}={}){
  let geometry = new Geometry();
  geometry.vertices.push(new Vector3(x, y, z));
  geometry.vertices.push(new Vector3(x2, y2, z2));
  let line = new Line(geometry, material);
  line.name = generateUniqueId({name:'line'});
  return line;
}