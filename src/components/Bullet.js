import {Geometry, LineBasicMaterial, Line, Vector3, SphereGeometry, MeshBasicMaterial, Mesh, Clock, Box3} from 'three';
import {generateUniqueId, signal, eventConfig as ec} from "core/core";

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    blueMaterial: new LineBasicMaterial({color:0x4286f4}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af}),
    sphereMaterial: new MeshBasicMaterial({color:0x4286f4, transparent:true, opacity:0.5}),
  },
  geometry:{
    sphere: new SphereGeometry(.5 , 16, 16)
  }
};

export default class Bullet{
  componentId = generateUniqueId({name:'Bullet'})
  distancePerSecond //NOTE: if you go to fast, hit test is incorrect. may need other approach.
  totalDistanceTraveled = 0
  distance = 0
  damage
  constructor({direction, distance=1000, distancePerSecond=300 , startPosition, damage=1,sphereGeometry=style.geometry.sphere, sphereMaterial=style.material.sphereMaterial}={}){
    this.distancePerSecond = distancePerSecond;
    this.direction = direction;
    this.distance = distance;
    this.damage = damage;
    let {x, y, z} = startPosition;
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = generateUniqueId({name:'sphere'});
    this.sphere.position.set(x, y, z);
    let endPosition = startPosition.clone().add(direction.multiplyScalar(distance));
    let {x:x2, y:y2, z:z2} = endPosition;

    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});

    this.hitBox = new Box3().setFromObject(this.sphere);

    this.clock = new Clock();
  }

  render({delta=this.clock.getDelta(), hittableComponents}={}) {
    if(this.stopTravelling){return;}
    this.performHitTestForEachPositionInTime({hittableComponents, delta});

    if(this.totalDistanceTraveled >= this.distance){
      signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
      return;
    }


  }

  performHitTestForEachPositionInTime({hittableComponents, delta, hitResolution=10, direction=this.direction, distancePerSecond=this.distancePerSecond, sphere=this.sphere}){
    for (let hr = 1; hr <= hitResolution; ++hr){
      let distance = (distancePerSecond * delta) / hitResolution;
      this.totalDistanceTraveled += distance;
      let newPosition = new Vector3().copy(direction).normalize().multiplyScalar(distance);
      sphere.position.add(newPosition);
      this.hitBox =  new Box3().setFromObject(this.sphere);
      let hit = this.performHitTest({hittableComponents});
      if(hit){
        return;
      }
    }
  }
  performHitTest({hittableComponents, hitBox=this.hitBox}){
    // console.log(`bullet performing hit test against ${hittableComponents.length} components`);
    let length = hittableComponents.length - 1;
    while(length >= 0){
      let hittableComponent = hittableComponents[length--];
      let otherHitBox = hittableComponent.hitBox;
      if(!otherHitBox){continue;}
      if(hitBox.intersectsBox(otherHitBox)){
        console.log('BULLET HIT SOMETHING ' + hittableComponent.componentId);
        signal.trigger(ec.hitTest.hitComponent, {hitComponent:hittableComponent, hitByComponent:this});
        signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
        this.stopTravelling = true;
        return true;
      }
    }
    return false;
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