import {Geometry, LineBasicMaterial, Line, Vector3, SphereGeometry, MeshBasicMaterial, Mesh, Clock, Box3, AudioListener, PositionalAudio, AudioLoader, Raycaster} from 'three';
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
    sphereMaterial: new MeshBasicMaterial({color:0x4286f4, transparent:true, opacity:0.15}),
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
  rayCaster
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

    //do this first. other functions are dependent on this.rayCastRadians
    this.preCalculateRayCastRadians();

    this.rayCaster = new Raycaster();

    let {x, y, z} = startPosition;
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);
    this.sphere.name = generateUniqueId({name:'sphere'});
    this.sphere.position.set(x, y, z);
    let endPosition = startPosition.clone().add(direction.multiplyScalar(distance));
    let {x:x2, y:y2, z:z2} = endPosition;

    this.threejsObject = this.createLine({x, y, z, x2, y2, z2});

    this.createLinesForEachRayCast({rayCastEndPoints:this.calculateRayCastEndPoints()});//draw visible raycast lines for debugging.

    this.hitBox = new Box3().setFromObject(this.sphere);//todo: remove
    this.createSounds({bulletSound, explosionSound, addSoundTo:this.sphere});
    this.clock = new Clock();
  }

  //
  rayCastRadians=[]
  /**
   * performance optimization
   * build cache of radians we use to draw the raycast lines for hit testing.
   * @param radians
   * @param degreeIncrement
   */
  preCalculateRayCastRadians({radians=this.rayCastRadians, degreeIncrement=45}={}){
    for(let d = 0; d < 360; d+=degreeIncrement){
      let radian = d * Math.PI / 180;
      radians.push(radian);
    }
  }

  /**
   * For debugging hit testing.
   * Draws lines starting at the center of the sphere, and going to each point on the surface of the sphere.
   * Any line that intersects with another object is considered a hit.
   * @param lines - array of lines we will add to. this registers the line to be added to the scene.
   * @param startPosition - beginning x,y,z for each line. typically the sphere threejs object's position
   * @param radius - length of line from center of sphere to surface.
   * @param material
   * @param rayCastEndPoints
   */
  createLinesForEachRayCast({lines=this.lines, startPosition=this.sphere.position, radius=this.radius, material=style.material.purpleMaterial, rayCastEndPoints=[]}={}){
    let {x, y, z} = startPosition;
    let createLine = this.createLine;
    for(let i = 0, len=rayCastEndPoints.length; i < len; ++i){
      let rayCastEndPoint = rayCastEndPoints[i];
      let {x2, y2, z2} = rayCastEndPoint;
      var line = createLine({x, y, z, x2, y2, z2, material});
      lines.push(line);
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
  //todo: some type of preliminary check to see if hittableComponent is anywhere close to ray endpoint.
  //e.g. if (rayCastEnpoint.x - sphere.position.x > radius) {return;}
  //todo: factor in delta somehow. perhaps by expanding radius in the direction we're going, and behind us.
  performHitTest({hittableComponents, damage=this.damage, hitExclusionComponentId=this.hitExclusionComponentId, radius=this.radius,
                   startPosition=this.sphere.startPosition, radians=this.rayCastRadians, rayCaster=this.rayCaster}){

    //first get the raycast endpoints
    let rayCastEndpoints = this.calculateRayCastEndPoints({startPosition, radius, radians});
    // console.log(`bullet performing hit test against ${hittableComponents.length} components`);
    for (let i =0, len=hittableComponents.length; i < len; ++i){ //fastest loop
      let hittableComponent = hittableComponents[i];
      if(hitExclusionComponentId == hittableComponent.componentId){continue;}

      let otherHitBox = hittableComponent.hitBox;
      if(!otherHitBox){continue;}

      this.performHitTestAgainstHittableComponent({hittableComponent, rayCastEndpoints});

    }
    return false;
  }

  performHitTestAgainstHittableComponent({hittableComponent, hitExclusionComponentId=this.hitExclusionComponentId, radius=this.radius, rayCastEndpoints, startPosition=this.sphere.position,
                                         rayCaster=this.rayCaster, damage=this.damage}){
    let dir = new Vector3();
    let hitBox = hittableComponent.threejsObject;//TODO: our main hit object now needs to be a mesh
    let doesHit = false;
    //iterate over each rayCastEndpoint
    for(let i=0, len=rayCastEndpoints.length; i < len; ++i){
      //get the rayCasts end vector
      let rayCastEndpoint = rayCastEndpoints[i];
      let {x2:x, y2:y, z2:z} = rayCastEndpoint;
      //calculate the direction by subtracting the vectors
      dir.subVectors({x,y,z}, startPosition).normalize();
      //set our raycaster to point in the direction we want to perform hit tests
      rayCaster.set(startPosition, dir, 0, radius);

      let intersects = rayCaster.intersectObject(hitBox);

      if(intersects.length > 0){
        let intersect = intersects[0];
        let {distance} = intersect;
        console.log(`hit something that was ${distance} distance away`);
        if(distance < radius){
          doesHit = true;
          break;
        }

      }
    }

    if(doesHit){
      console.log('BULLET HIT SOMETHING ' + hittableComponent.componentId);
      signal.trigger(ec.hitTest.hitComponent, {hitComponent:hittableComponent, hitByComponent:this, damage});
      signal.trigger(ec.stage.destroyComponent, {componentId:this.componentId});
      this.stopTravelling = true;

      this.createAndRegisterPositionalSound({src:bulletExplosionSound, playWhenReady:true});
    }

    return doesHit;
  }

  /**
   * When performing a hit test for a sphere shaped bullet, we want to send rays from the center of the sphere to points
   * on the surface of the sphere.
   * Currently calculates points for 3 planes.
   * @param startPosition - x, y, z where lines should start from
   * @param radius - line length from startPosition
   * @param radians - number of lines per plane. this is precalculated on initialization in order to avoid unneeded calcs during frame rendering.
   */
  calculateRayCastEndPoints({startPosition=this.sphere.position, radius=this.radius, radians=this.rayCastRadians}={}){
    let {x, y, z} = startPosition;//starting point of each line we draw
    let x2, y2, z2;
    let rayCastEndPoints = [];
    //we want to create lines inside the bullet sphere, in such a way that they'll be useful for hit testing
    for(let i = 0, len=radians.length; i < len; ++i){
      let radian = radians[i];

      //perfect back to front circle. flat z
      x2 = x - radius * Math.sin(radian);
      y2 = y - radius * Math.cos(radian);
      z2 = z;
      rayCastEndPoints.push({x2, y2, z2});

      //perfect left to right circle. flat y
      x2 = x + radius * Math.sin(radian);
      y2 = y;
      z2 = z + radius * Math.cos(radian);
      rayCastEndPoints.push({x2, y2, z2});

      //perfect left to right circle. flat x
      x2 = x;
      y2 = y - radius * Math.sin(radian);
      z2 = z - radius * Math.cos(radian);
      rayCastEndPoints.push({x2, y2, z2});
    }
    return rayCastEndPoints;
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