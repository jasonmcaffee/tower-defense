import {Geometry, LineBasicMaterial, Line, Vector3, SphereGeometry, MeshBasicMaterial, Mesh, Clock, Box3, AudioListener, PositionalAudio, AudioLoader} from 'three';
import {generateUniqueId, signal, eventConfig as ec} from "core/core";
import laserSound from 'sounds/lazer1.mp3';
import bulletExplosionSound from 'sounds/bulletexplosion1.mp3';

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    blueMaterial: new LineBasicMaterial({color:0x4286f4, transparent:false, opacity:0.15}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af, transparent:false, opacity:0.25}),
    sphereMaterial: new MeshBasicMaterial({color:0x4286f4, transparent:true, opacity:0}),
    sphereMaterialRed: new MeshBasicMaterial({color:0xcc001e, transparent:true, opacity:0.75}),
    sphereMaterialOrange: new MeshBasicMaterial({color:0xea8800, transparent:false}),
  },
  geometry:{
    sphere: new SphereGeometry(.5 , 16, 16)
  }
};

export default class BulletB{
  componentId = generateUniqueId({name:'BulletB'})
  distancePerSecond //NOTE: if you go to fast, hit test is incorrect. may need other approach.
  totalDistanceTraveled = 0
  distance = 0
  damage
  hitExclusionComponentId //player bullet shouldn't be able to hit player.
  bulletAudio
  lines = []
  static get style() {return style;}
  constructor({direction, distance=1000, distancePerSecond=10 , startPosition, damage=1,sphereGeometry=style.geometry.sphere,
                sphereMaterial=style.material.sphereMaterial, hitExclusionComponentId, bulletSound=laserSound, explosionSound=bulletExplosionSound,
                hitResolution=10}={}){
    this.distancePerSecond = distancePerSecond;
    this.direction = direction;
    this.distance = distance;
    this.damage = damage;
    this.hitResolution = hitResolution;
    this.radius = sphereGeometry.parameters.radius;

    this.hitExclusionComponentId = hitExclusionComponentId;
    let {x, y, z} = startPosition;
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = generateUniqueId({name:'sphere'});
    this.sphere.position.set(x, y, z);
    let endPosition = startPosition.clone().add(direction.multiplyScalar(distance));
    let {x:x2, y:y2, z:z2} = endPosition;

    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});

    this.createLinesInEachDirection()

    this.hitBox = new Box3().setFromObject(this.sphere);

    this.createSounds({bulletSound, explosionSound, addSoundTo:this.sphere});

    this.clock = new Clock();
  }

  //bullet direction shouldn't matter
  createLinesInEachDirection({lines=this.lines, position=this.sphere.position, radius=this.radius, sphere=this.sphere, numberOfLines=1000, material=style.material.purpleMaterial}={}){
    let {x, y, z} = position;
    let createLine = this.createLine;
    function doLine(x2, y2, z2){
      // var {x: x2, y: y2, z: z2} = endPosition;
      var line = createLine({x, y, z, x2, y2, z2, material});
      lines.push(line);
    }
    //2 radians equals 360 degrees
    //1 radians equals 180 deg
    //.5 radians equals 90 deg

    let degreeMin = 0;
    let degreeMax = 360
    let degreeIncrement = 45;


    //perfect back to front circle. flat x
    for(let d = degreeMin; d < degreeMax; d+=degreeIncrement){
      let radian = d * Math.PI / 180;
      let x2 = x - radius * Math.sin(radian);
      let y2 = y - radius * Math.cos(radian);
      let z2 = z;
      doLine(x2, y2, z2);
    }

     //perfect left to right circle. flat y
    for(let d = degreeMin; d < degreeMax; d+=degreeIncrement){
      let radian = d * Math.PI / 180;
      let x2 = x + radius * Math.sin(radian);
      let y2 = y;
      let z2 = z + radius * Math.cos(radian);
      doLine(x2, y2, z2);
    }

    //perfect left to right circle. flat z
    for(let d = degreeMin; d < degreeMax; d+=degreeIncrement){
      let radian = d * Math.PI / 180;
      let x2 = x ;
      let y2 = y - radius * Math.sin(radian);
      let z2 = z - radius * Math.cos(radian);
      doLine(x2, y2, z2);
    }

  }

  createSounds({bulletSound, explosionSound, addSoundTo}){
    let {audio, listener} = this.createPositionalSound({src:bulletSound, playWhenReady:true});
    addSoundTo.add(audio);
    signal.trigger(ec.camera.attachAudioListenerToCamera, {listener});
  }

  createAndRegisterPositionalSound({src, addSoundTo=this.sphere, playWhenReady=false}){
    let {audio, listener} = this.createPositionalSound({src, playWhenReady});
    addSoundTo.add(audio);
    signal.trigger(ec.camera.attachAudioListenerToCamera, {listener});
  }

  render({delta=this.clock.getDelta(), hittableComponents}={}) {
    if(this.stopTravelling){return;}
    //first move the object
    this.calculateAndMoveToNewPosition({delta});

    //if we've surpassed the range of the bullet, destroy ourselves.
    if(this.totalDistanceTraveled >= this.distance){
      this.stopTravelling = true;
      signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
      return;
    }

    this.performHitTest({hittableComponents, delta});
  }

  calculateAndMoveToNewPosition({delta, direction=this.direction, distancePerSecond=this.distancePerSecond, sphere=this.sphere, lines=this.lines}){
    let distance = (distancePerSecond * delta);
    this.totalDistanceTraveled += distance;
    let newPosition = new Vector3().copy(direction).normalize().multiplyScalar(distance);
    sphere.position.add(newPosition);

    //console.log(`direction ${JSON.stringify(direction)} position ${JSON.stringify(newPosition)}`);
    for(let i=0, len=lines.length; i < len; ++i){
      let line = lines[i];
      line.position.add(newPosition);
    }
  }

  //expects hitBox in hittableComponents objects
  performHitTest({hittableComponents, hitBox=this.hitBox, damage=this.damage, hitExclusionComponentId=this.hitExclusionComponentId, bulletRadius=this.radius}){
    // console.log(`bullet performing hit test against ${hittableComponents.length} components`);
    for (let i =0, len=hittableComponents.length; i < len; ++i){ //fastest loop
      let hittableComponent = hittableComponents[i];
      if(hitExclusionComponentId == hittableComponent.componentId){continue;}

      let otherHitBox = hittableComponent.hitBox;
      if(!otherHitBox){continue;}


    }
    return false;
  }

  calculateRayCastDirections({bulletPosition=this.sphere.position, bulletRadius=this.radius, bulletDirection=this.direction}){
    let startPosition = bulletPosition;
    let distance = bulletRadius;
    let endPosition = new Vector3().copy(bulletPosition).normalize().multiplyScalar(distance);//just so we can draw lines
    return {startPosition, endPosition, distance};
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
    for(let i=0, len=this.lines.length; i < len; ++i){
      let line = this.lines[i];
      scene.add(line);
    }
  }

  createPositionalSound({src, repeat=false, playWhenReady=false}={}){
    let listener = new  AudioListener();

    var audio = new PositionalAudio( listener );
    var audioLoader = new AudioLoader();
    audioLoader.load(src, function( buffer ) {
      audio.setBuffer( buffer );
      audio.setRefDistance( 10);
      if(repeat){
        audio.setLoop(true);
      }
      if(playWhenReady){
        audio.play();
      }
    });

    return {audio, listener};
  }

  destroy({scene, name=this.threejsObject.name}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    object3d = scene.getObjectByName(this.sphere.name);
    scene.remove(object3d);
  }
}