import {BoxGeometry, SphereGeometry, MeshPhongMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";


let standardGeomatry = new SphereGeometry(20, 32, 32);
standardGeomatry.computeBoundingBox();

import earthSurfaceImage from 'images/earth/earthSurface.jpg';

export default class Earth{
  componentId = generateUniqueId({name:'RotatingBox'})
  hitBox //used to determine if something hit us
  constructor({x=0, y=0, z=0}={}){

    this.image = new Image();
    this.image.src = earthSurfaceImage;
    let texture = new Texture();
    texture.image = this.image;
    this.image.onload = ()=>{
      texture.needsUpdate = true;
    }
    let material = new MeshPhongMaterial( {map: texture, ambient: 0x333333} );

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
      //signal.trigger(ec.stage.destroyComponent, {componentId});
    }
  }
  render() {
    // this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.02;
    //this.threejsObject.rotation.z += 0.01;
    this.hitBox = new Box3().setFromObject(this.threejsObject); //allow for moving box
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