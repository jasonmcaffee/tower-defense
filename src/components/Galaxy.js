import {BoxGeometry, SphereGeometry, MeshPhongMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D, ImageUtils, ShaderLib, UniformsUtils, ShaderMaterial, DoubleSide, BackSide, RepeatWrapping} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";


let standardGeomatry = new SphereGeometry(20, 32, 32);
standardGeomatry.computeBoundingBox();

import galaxyImageSource from 'images/galaxy/galaxy3.png';
import galaxy2ImageSource from 'images/galaxy/galaxy2.jpg';
/**
 * big sphere with backside display of image
 */
export default class Galaxy{
  componentId = generateUniqueId({name:'Galaxy'})
  hitBox //used to determine if something hit us
  constructor({x=0, y=0, z=0, radius=600}={}){

    let galaxyMesh = this.createGalaxyMesh({radius});
    this.galaxy2Mesh = this.createGalaxyMesh({radius: radius -5, imageSource:galaxy2ImageSource, transparent:true, opacity:0.2, repeat:1});
    galaxyMesh.add(this.galaxy2Mesh);
    this.threejsObject = galaxyMesh;
    this.threejsObject.name = this.componentId;
    this.threejsObject.position.set(x, y, z);

    signal.registerSignals(this);
  }

  createGalaxyMesh({radius, imageSource=galaxyImageSource, repeat=8, transparent=false, opacity=1}){
    function onload(){
      if(typeof material != undefined){
        material.needsUpdate = true;
      }
      galaxyTexture.wrapS = RepeatWrapping;
      galaxyTexture.wrapT = RepeatWrapping;
      galaxyTexture.offset.set(0,0);
      galaxyTexture.repeat.set(repeat,repeat);
    }
    let galaxyTexture = this.createTextureFromImage({imageSource, onload});
    let geometry   = new SphereGeometry(radius, 32, 32);
    let material  = new MeshPhongMaterial({
      map     : galaxyTexture,
      side        : BackSide,
      //side        : DoubleSide,
      transparent,
      opacity
    })
    let galaxyMesh = new Mesh(geometry, material);
    return galaxyMesh;
  }

  createTextureFromImage({imageSource, onload=()=>{}}){
    let image = new Image();
    image.src = imageSource;
    let texture = new Texture();
    texture.image = image;
    image.onload = ()=>{texture.needsUpdate=true; onload();}
    return texture;
  }

  signals = {
    [ec.player.positionChanged]({x, y, z}){
      this.playerPosition = {x, y, z};
    }
  }
  render() {
    this.threejsObject.rotation.y += 0.00007;
    this.galaxy2Mesh.rotation.x += 0.00005;
    if(this.playerPosition){
      let {x, y, z} = this.playerPosition;
      this.threejsObject.position.set(x, y, z);
    }

  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.unregisterSignals(this);
  }

}