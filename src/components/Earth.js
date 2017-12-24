import {BoxGeometry, SphereGeometry, MeshPhongMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D, ImageUtils, ShaderLib, UniformsUtils, ShaderMaterial, DoubleSide, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';

let standardGeomatry = new SphereGeometry(20, 32, 32);
standardGeomatry.computeBoundingBox();

// import earthSurfaceImageSource from 'images/earth/earthSurface.jpg';
import earthSurfaceImageSource from 'images/earth/earthhdsurface-smaller.jpg';


//import earthBumpMapImageSource from 'images/earth/earthhdbumpmap.jpg';
// import earthAtmosphereImageSource from 'images/earth/earthAtmosphere.png';
import earthAtmosphereImageSource from 'images/earth/earthcloudshd-smaller.png';

// import earthSurfaceSpecularImageSource from 'images/earth/earthSurfaceSpecular.jpg';

import earthExplosionSoundSource from 'sounds/earth-exploding.mp3';

/**
 * http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/
 */
export default class Earth{
  componentId = generateUniqueId({name:'Earth'})
  hitBox //used to determine if something hit us
  hitPoints
  constructor({x=0, y=0, z=-300, radius=150, hitPoints=20}={}){
    this.hitPoints = hitPoints;
    signal.trigger(ec.earth.hitPointsChanged, {hitPoints:this.hitPoints});
    let {globeMesh, cloudMesh} = this.createGlobeMesh({radius});
    this.cloudMesh = cloudMesh;
    this.cloudMesh.position.set(x,y,z);
    this.threejsObject = globeMesh;
    this.threejsObject.name = this.componentId;
    this.threejsObject.position.set(x, y, z);
    this.hitBox = new Sphere(this.threejsObject.position, radius);

    this.explodingEarthAudio = createAudio({src: earthExplosionSoundSource});

    signal.registerSignals(this);
    signal.trigger(ec.enemy.targetPositionChanged, {x, y, z, componentId:this.componentId});//let enemies know where we are.
  }

  createGlobeMesh({radius}){
    function onload(){
      if(typeof globeMaterial != undefined){
        material.needsUpdate = true;
        console.log('material updated');
      }
    }
    let earthSurfaceTexture = this.createTextureFromImage({imageSource: earthSurfaceImageSource, onload});
    let earthAtmosphereTexture = this.createTextureFromImage({imageSource: earthAtmosphereImageSource, onload});
    //let earthBumpTexture = this.createTextureFromImage({imageSource: earthBumpMapImageSource, onload});

    let geometry   = new SphereGeometry(radius, 32, 32);
    geometry.computeBoundingBox();
    let cloudGeometry = new SphereGeometry(radius + 2, 32, 32);
    cloudGeometry.computeBoundingBox();
    //globe
    let globeMaterial  = new MeshPhongMaterial({
      map:earthSurfaceTexture,
      //bumpMap: earthBumpTexture,
      bumpScale: 8,
    });

    let globeMesh = new Mesh(geometry, globeMaterial);

    //clouds
    let material  = new MeshPhongMaterial({
      map     : earthAtmosphereTexture,
      side        : DoubleSide,
      opacity     : 0.5,
      transparent : true,
      depthWrite  : false,
    })
    let cloudMesh = new Mesh(cloudGeometry, material)
    //globeMesh.add(cloudMesh);

    return {globeMesh, cloudMesh};

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
    [ec.hitTest.hitComponent]({hitComponent, damage}){
      if(this.hasDied){return;}
      let componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      this.hitPoints -= damage;
      signal.trigger(ec.earth.hitPointsChanged, {hitPoints:this.hitPoints});

      if(this.hitPoints <=0){
        this.hasDied = true;
        signal.trigger(ec.earth.died);
        this.explode();
      }
      //
    }
  }

  explode({componentId=this.componentId, numberOfTimedExplosions=4, explosionIntervalMs=4000}={}){
    console.log(`earth exploded`);
    this.explodingEarthAudio.play();
    this.isExploding = true;
    signal.trigger(ec.stage.destroyComponent, {componentId});

    let self = this;
    this.fireBullets();
    let completedTimedExplosions = 1;
    let intervalId = setInterval(()=>{
      if(completedTimedExplosions++ >= numberOfTimedExplosions){
        clearInterval(intervalId);
        clearInterval(cloudExpansionIntervalId);
        signal.trigger(ec.earth.doneExploding);
      }else{
        self.fireBullets();
      }
    }, explosionIntervalMs);

    //increase the size of the cloudmesh
    let scale = .01;
    let cloudExpansionIntervalId = setInterval(()=>{ //since render stops firing after destroyComponent is called, do your own loop.
      self.cloudMesh.scale.x += scale;
      self.cloudMesh.scale.y += scale;
      self.cloudMesh.scale.z += scale;
    }, 30);

  }
  fireBullets({numberOfBullets=100}={}){
    for(let i=1; i < numberOfBullets; ++i){
      this.fireBulletAtRandomLocation();
    }
  }
  fireBulletAtRandomLocation({nearestTargetVector=this.nearestTargetVector, threejsObject=this.threejsObject, componentId=this.componentId,
       bulletMaterial=Bullet.style.material.sphereMaterialRed, bulletDistancePerSecond=40, damage=100, hitResolution=1,
       playSound=false, sphereGeometry=Bullet.style.geometry.earthExplosionSphere}={}){
    let min = -10000;
    let max = 10000;
    let positionToFireAt = {x:grn({min, max}), y:grn({min, max}), z:grn({min, max})};
    let startPosition = threejsObject.position.clone();
    let direction = new Vector3();
    direction.subVectors(positionToFireAt, startPosition);

    let bullet = new Bullet({direction, startPosition, hitExclusionComponentId:componentId, sphereGeometry,
      sphereMaterial: bulletMaterial, distancePerSecond:bulletDistancePerSecond, damage, hitResolution, playSound});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  render() {
    // this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.0007;
    this.cloudMesh.rotation.y += 0.0006;
    //this.threejsObject.rotation.z += 0.01;
    this.hitBox = new Box3().setFromObject(this.cloudMesh); //allow for moving box
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    scene.add(this.cloudMesh);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }

}

function createAudio({src}={}){
  let audio = new Audio();
  audio.src = src;
  //audio.play();
  return audio;
}