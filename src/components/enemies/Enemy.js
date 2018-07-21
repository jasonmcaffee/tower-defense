import {Raycaster, Clock, CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';

/**
 * Enemy - 
 */
export default class Enemy{
  componentId = generateUniqueId({name:'Enemy'})
  threejsObject
  hitBox
  moveClock = new Clock()
  constructor({x=0, y=0, z=0, hitPoints=1, moveDistancePerSecond=9, fireIntervalMs=1000, firingRange=10, damage=1, pathVectors=[], towerPositions=[], size=10,
                hitExclusionComponentIds=[], bulletDistancePerSecond=10}={}){
    this.size = size;
    this.damage = damage;
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId, size});
    this.threejsObject = threejsObject;
    this.hitBox = hitBox;
    this.hitPoints = hitPoints;
    this.moveDistancePerSecond = moveDistancePerSecond;
    this.firingRange = firingRange;
    this.fireIntervalMs = fireIntervalMs;
    this.damage = damage;
    this.position = {x, y, z};
    this.pathVectors = pathVectors;
    this.towerPositions = towerPositions;
    this.currentPathVectorsIndex = 0;
    this.isDead = false;
    this.hitExclusionComponentIds = hitExclusionComponentIds;
    this.hitExclusionComponentIds.push(this.componentId);
    this.bulletDistancePerSecond = bulletDistancePerSecond;

    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, damage}){
      const componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      console.log(`enemy hit. ${damage}`);
      this.hitPoints -= damage;
      if(this.hitPoints <= 0){
        console.log(`enemy took too much damage and is about to be killed.`);
        this.kill();
      }

    }
  }

  render(){
    if(this.isDead){return;}
    //todo: move along the path.
    this.travelPath();
    //todo: find closest enemy
  }

  startFiring(){
    const self = this;
    // this.fireInterval = setInterval(()=>{
    //   self.fireBulletAtNearestTower();
    // }, this.fireIntervalMs);
  }

  fireBulletAtNearestTower(){

  }
  fireBullet({direction, damage=this.damage, startPosition=this.threejsObject.position, hitExclusionComponentIds=this.hitExclusionComponentIds,
               ownerComponentId=this.componentId, distancePerSecond=this.bulletDistancePerSecond}={}){
    console.log(`Enemy firing bullet in direction: `, direction);
    let bullet = new Bullet({damage, direction, startPosition, hitExclusionComponentIds, ownerComponentId, playSound: false, distancePerSecond});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  getVectorToTravelTo({pathVectors=this.pathVectors, currentPathVectorsIndex=this.currentPathVectorsIndex}={}){
    const pathVector = pathVectors[currentPathVectorsIndex];
    const {x2: x, y2: y, z2: z} = pathVector; //we want the second
    return {x, y, z};
  }

  travelPath({nearestTargetVector=this.getVectorToTravelTo(), delta=this.moveClock.getDelta(), moveDistancePerSecond=this.moveDistancePerSecond}={}){
    if(!nearestTargetVector){ return;}
    // console.log(`enemy.travelPath`);
    //where we are traveling from
    let startPosition = this.threejsObject.position;
    //where we are traveling to
    let pathPointVector = new Vector3(nearestTargetVector.x, nearestTargetVector.y, nearestTargetVector.z);

    //direction we're going
    let direction = new Vector3();
    direction.subVectors(pathPointVector, startPosition);

    //how far we've traveled
    let distance = (moveDistancePerSecond * delta);


    //if we've hit the path vector, increase the index so we start traveling towards the next.
    let oppositeDirection = new Vector3();
    oppositeDirection.subVectors(startPosition, pathPointVector);

    // this.fireBullet({direction: oppositeDirection, startPosition: pathPointVector});

    const raycaster = new Raycaster(pathPointVector, oppositeDirection);
    const intersects = raycaster.intersectObject(this.threejsObject);
    if(intersects.length > 0 ){ //&& intersects[0].distance < .1
      console.log(`intersects: `, intersects);
      console.log(`enemy position: x: ${this.threejsObject.position.x}    y: ${this.threejsObject.position.y}   z: ${this.threejsObject.position.z}`);
      this.startMovingTowardsNextPathVector();
    }


    //update position
    let newPosition = new Vector3().copy(direction).normalize().multiplyScalar(distance);
    this.threejsObject.position.add(newPosition);
    // console.log(`enemy pos: x: ${this.threejsObject.position.x} y: ${this.threejsObject.position.y} `);
    this.hitBox = new Box3().setFromObject(this.threejsObject);
    signal.trigger(ec.hitTest.updateComponentHitBox, {component:this});

    //let others know the position changed.
    const {x, y, z} = this.threejsObject.position;
    signal.trigger(ec.enemy.positionChanged, {componentId: this.componentId, x, y, z });//let towers know where we are.



  }

  startMovingTowardsNextPathVector({pathVectors=this.pathVectors, currentPathVectorsIndex=this.currentPathVectorsIndex}={}){
    if(currentPathVectorsIndex >= pathVectors.length - 1){
      console.warn(`no other path vectors for enemy to travel to`);
      signal.trigger(ec.enemy.reachedEndOfPath, {componentId: this.componentId});
      this.kill();
      return;
    }
    this.currentPathVectorsIndex++;
  }

  kill(){
    signal.trigger(ec.stage.destroyComponent, {componentId: this.componentId});
  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    console.log(`Enemy destroy called`);
    this.isDead = true;
    signal.trigger(ec.enemy.died, {componentId});
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
    signal.unregisterSignals(this);
    clearInterval(this.fireInterval);
  }
}





function createThreejsObjectAndHitbox({componentId, x, y, z, size}){
  const material = new MeshNormalMaterial();
  const geometry = new CubeGeometry(size, size, size);
  geometry.computeBoundingBox();
  const threejsObject = new Mesh(geometry, material);
  threejsObject.position.set(x, y, z);
  threejsObject.name = componentId;//needed for removing from scene
  const hitBox = new Box3().setFromObject(threejsObject);
  return {threejsObject, hitBox};
}