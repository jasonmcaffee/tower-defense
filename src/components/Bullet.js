import {Geometry, LineBasicMaterial, Line, Vector3, SphereGeometry, MeshBasicMaterial, Mesh, Clock} from 'three';
import {generateUniqueId} from "core/core";

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    blueMaterial: new LineBasicMaterial({color:0x4286f4}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af}),
    sphereMaterial: new MeshBasicMaterial({color:0x4286f4}),
  },
  geometry:{
    sphere: new SphereGeometry(1 , 32, 32)
  }
};

export default class Bullet{
  componentId = generateUniqueId({name:'Bullet'})
  distancePerSecond = 1
  constructor({direction, distance=1000, distancePerSecond=100 , startPosition, sphereGeometry=style.geometry.sphere, sphereMaterial=style.material.sphereMaterial}={}){
    this.distancePerSecond = distancePerSecond;
    this.direction = direction;

    let {x, y, z} = startPosition;
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = generateUniqueId({name:'sphere'});
    this.sphere.position.set(x, y, z);
    let endPosition = startPosition.clone().add(direction.multiplyScalar(distance));
    let {x:x2, y:y2, z:z2} = endPosition;

    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});
    this.clock = new Clock();
  }

  render({delta=this.clock.getDelta()}={}) {
    let distance = this.distancePerSecond * delta;
    let newPosition = new Vector3().copy(this.direction).normalize().multiplyScalar(distance);
    this.sphere.position.add(newPosition);
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
    scene.add(this.sphere);
  }

  destroy({scene, name=this.threejsObject.name}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    object3d = scene.getObjectByName(this.sphere.name);
    scene.remove(object3d);
  }

}