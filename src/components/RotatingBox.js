import {BoxGeometry, CubeGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';

let material = new MeshNormalMaterial();
let standardGeomatry = new CubeGeometry(.2, .2, .2);
standardGeomatry.computeBoundingBox();

export default class RotatingBox{
  componentId = generateUniqueId({name:'RotatingBox'})
  hitBox //used to determine if something hit us
  constructor({x=0, y=0, z=0, numberOfBulletsOnExplode=10, bulletDistance=10, bulletDamage=5}={}){

    this.numberOfBulletsOnExplode = numberOfBulletsOnExplode;
    this.bulletDistance = bulletDistance;
    this.bulletDamage = bulletDamage;

    let geometry = standardGeomatry;
    this.threejsObject = new Mesh(geometry, material);
    this.threejsObject.position.set(x, y, z);
    this.threejsObject.name = this.componentId;//needed for removing from scene
    this.hitBox = new Box3().setFromObject(this.threejsObject);
    signal.registerSignals(this);
  }
  signals = {
    [ec.hitTest.hitComponent]({hitComponent}){
      let componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      this.explode();
      signal.trigger(ec.stage.destroyComponent, {componentId});
    }
  }
  render() {
    this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.02;
    this.hitBox = new Box3().setFromObject(this.threejsObject); //allow for moving box
  }

  explode({numberOfBulletsOnExplode=this.numberOfBulletsOnExplode, bulletDistance=this.bulletDistance}={}){
    if(this.hasExploded){return;} //hits can occur briefly after destroy component is fired.
    console.log(`exploding ${numberOfBulletsOnExplode} bullets`);
    for(let i = 0; i < numberOfBulletsOnExplode; ++i){
      this.fireBulletInRandomDirection();
    }
    this.hasExploded = true;
  }

  fireBulletInRandomDirection({threejsObject=this.threejsObject, distance=this.bulletDistance, min=-10000, max=10000,
                                sphereMaterial=Bullet.style.material.sphereMaterialOrange, damage=this.bulletDamage, hitResolution=1}={}){
    let positionVector = new Vector3(grn({min, max}), grn({min, max}), grn({min, max}));

    let startPosition = threejsObject.position.clone();
    let direction = new Vector3();
    direction.subVectors(positionVector, startPosition);

    let bullet = new Bullet({direction, startPosition, hitExclusionComponentId:this.componentId, distance, sphereMaterial, distancePerSecond: 2, damage, hitResolution});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }

}