import {Geometry, LineBasicMaterial, Line, Vector3, SphereGeometry, MeshBasicMaterial, Mesh, Clock, Box3, AudioListener, PositionalAudio, AudioLoader, CubeGeometry} from 'three';
import {generateUniqueId, signal, eventConfig as ec} from "core/core";
import laserSound from 'sounds/lazer1.mp3';
import bulletExplosionSound from 'sounds/bulletexplosion1.mp3';

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    blueMaterial: new LineBasicMaterial({color:0x4286f4, transparent:true, opacity:0.15}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af, transparent:true, opacity:0.25}),
    sphereMaterial: new MeshBasicMaterial({color:0x4286f4, transparent:false, opacity:0.5}),
    sphereMaterialRed: new MeshBasicMaterial({color:0xcc001e, transparent:false, opacity:0.75}),
    sphereMaterialOrange: new MeshBasicMaterial({color:0xea8800, transparent:false}),
  },
  geometry:{
    sphere: new SphereGeometry(.5 , 16, 16),
    earthExplosionSphere: new SphereGeometry(3, 16, 16),
    box: new CubeGeometry(.2, .2, .2)
  }
};

style.geometry.sphere.computeBoundingSphere();

export default class Bullet{
  componentId = generateUniqueId({name:'BulletC'})
  distancePerSecond //NOTE: if you go to fast, hit test is incorrect. may need other approach.
  totalDistanceTraveled = 0
  distance = 0
  damage
  // hitExclusionComponentId //player bullet shouldn't be able to hit player.
  hitExclusionComponentIds
  bulletAudio
  ownerComponentId //so we can add to score when player hits something.
  static get style() {return style;}
  playSound = true //whether sound should be played for the bullet.
  constructor({direction, distance=500, distancePerSecond=300 , startPosition, damage=1,sphereGeometry=style.geometry.sphere,
                sphereMaterial=style.material.sphereMaterial, hitExclusionComponentId, bulletSound=laserSound, explosionSound=bulletExplosionSound,
                hitResolution=10, ownerComponentId, playSound=true, hitExclusionComponentIds=[], trackEnemyComponentId}={}){
    this.distancePerSecond = distancePerSecond;
    this.direction = direction;
    this.distance = distance;
    this.damage = damage;
    this.hitResolution = hitResolution;
    this.ownerComponentId = ownerComponentId;
    this.playSound = playSound;
    this.trackEnemyComponentId = trackEnemyComponentId;

    // this.hitExclusionComponentId = hitExclusionComponentId;
    if(hitExclusionComponentId){
      hitExclusionComponentIds.push(hitExclusionComponentId);
    }
    this.hitExclusionComponentIds = hitExclusionComponentIds;

    let {x, y, z} = startPosition;
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = generateUniqueId({name:'sphere'});
    this.sphere.position.set(x, y, z);
    let endPosition = startPosition.clone().add(direction.multiplyScalar(distance));
    let {x:x2, y:y2, z:z2} = endPosition;

    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});

    this.hitBox = new Box3().setFromObject(this.sphere);

    this.createSounds({bulletSound, explosionSound, addSoundTo:this.sphere});

    this.clock = new Clock();
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitTestResult]({doesIntersect, hitteeComponentId, hitComponentId, damage=this.damage, ownerComponentId=this.ownerComponentId, hitExclusionComponentIds=this.hitExclusionComponentIds}){
      if(this.componentId !== hitteeComponentId || this.hasHit || hitExclusionComponentIds.includes(hitComponentId) ){return;}
      this.hasHit = true;

      // console.log(`bulletc received webworker hitTestResult: doesIntersect: ${doesIntersect}  hitteeComponentId:${hitteeComponentId}  hitComponentId:${hitComponentId}`);
      // console.log('BULLET HIT SOMETHING ' + hitComponentId);
      signal.trigger(ec.hitTest.hitComponent, { hitComponent:{componentId:hitComponentId}, hitByComponent:this, damage, ownerComponentId} );
      signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
      this.stopTravelling = true;
      this.createAndRegisterPositionalSound({src:bulletExplosionSound, playWhenReady:true});
    },

    //track/follow enemies
    [ec.enemy.positionChanged]({componentId, x, y, z}){
      if(this.trackEnemyComponentId !== componentId){return;}
      console.log(`bullet tracking componentId: ${componentId}`);
      const targetVector = new Vector3(x, y, z);
      const startPosition = this.sphere.position;
      let direction = new Vector3();
      direction.subVectors(targetVector, startPosition);
      this.direction = direction; //next render will reference this
    }
  }

  createSounds({bulletSound, explosionSound, addSoundTo, playSound=this.playSound}){
    if(!playSound){return;}
    let {audio, listener} = this.createPositionalSound({src:bulletSound, playWhenReady:true});
    addSoundTo.add(audio);
    signal.trigger(ec.camera.attachAudioListenerToCamera, {listener});
  }

  createAndRegisterPositionalSound({src, addSoundTo=this.sphere, playWhenReady=false, playSound=this.playSound}){
    if(!playSound){return;}
    let {audio, listener} = this.createPositionalSound({src, playWhenReady});
    addSoundTo.add(audio);
    signal.trigger(ec.camera.attachAudioListenerToCamera, {listener});
  }

  render({delta=this.clock.getDelta(), hittableComponents}={}) {
    if(this.stopTravelling){return;}
    this.performHitTestForEachPositionInTime({hittableComponents, delta});

    if(this.totalDistanceTraveled >= this.distance){
      signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
      return;
    }
  }

  //if we move fast, we jump coordinates in big spaces.
  //hitResolution allows us to divide up those big spaces into separate points, so we can hit test at each point.
  performHitTestForEachPositionInTime({hittableComponents, delta, hitResolution=this.hitResolution, direction=this.direction, distancePerSecond=this.distancePerSecond, sphere=this.sphere}){
    for (let hr = 1; hr <= hitResolution; ++hr){
      let distance = (distancePerSecond * delta) / hitResolution;
      this.totalDistanceTraveled += distance;
      let newPosition = new Vector3().copy(direction).normalize().multiplyScalar(distance);
      sphere.position.add(newPosition);
      this.hitBox =  new Box3().setFromObject(this.sphere);
      if(this.hasHit){return;} //stop processing if we get back a result from hitTest service.
      this.performHitTest();
    }
  }

  //expects hitBox in hittableComponents objects
  performHitTest({hitteeComponent=this}={}){
    signal.trigger(ec.hitTest.performHitTest, {hitteeComponent});
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
    signal.unregisterSignals(this);
    //to stop web worker
  }
}