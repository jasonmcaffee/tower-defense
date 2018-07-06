import {Raycaster, Clock, CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

/**
 * Enemy - 
 */
export default class Enemy{
  componentId = generateUniqueId({name:'Enemy'})
  threejsObject
  hitBox
  moveClock = new Clock()
  constructor({x=0, y=0, z=0, hitPoints=10, moveDistancePerSecond=9, fireIntervalMs=1000, firingRange=10, damage=1, pathVectors=[], towerPositions=[]}={}){
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId});
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
    signal.registerSignals(this);
  }

  signals = {
    [ec.hitTest.hitComponent]({hitComponent, damage}){
      const componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      console.log(`enemy hit. ${damage}`);

    }
  }

  render(){
    //todo: move along the path.
    this.travelPath();
    //todo: find closest enemy
  }

  startFiring(){
    const self = this;
    this.fireInterval = setInterval(()=>{
      self.fireBulletAtNearestTower();
    }, this.fireIntervalMs);
  }

  fireBulletAtNearestTower(){

  }
  fireBullet({direction}={}){
    console.log(`Enemy firing bullet in direction: `, direction);
  }

  getVectorToTravelTo({pathVectors=this.pathVectors, currentPathVectorsIndex=this.currentPathVectorsIndex}={}){
    const pathVector = pathVectors[currentPathVectorsIndex];
    const {x2: x, y2: y, z2: z} = pathVector; //we want the second
    return {x, y, z};
  }

  travelPath({nearestTargetVector=this.getVectorToTravelTo(), delta=this.moveClock.getDelta(), moveDistancePerSecond=this.moveDistancePerSecond}={}){
    if(!nearestTargetVector){ return;}

    //where we are traveling from
    let startPosition = this.threejsObject.position;
    //where we are traveling to
    let pathPointVector = new Vector3(nearestTargetVector.x, nearestTargetVector.y, nearestTargetVector.z);

    //direction we're going
    let direction = new Vector3();
    direction.subVectors(pathPointVector, startPosition);

    //how far we've traveled
    let distance = (moveDistancePerSecond * delta);

    //update position
    let newPosition = new Vector3().copy(direction).normalize().multiplyScalar(distance);
    this.threejsObject.position.add(newPosition);
    this.hitBox = new Box3().setFromObject(this.threejsObject);
    signal.trigger(ec.hitTest.updateComponentHitBox, {component:this});

    //if we've hit the path vector, increase the index so we start traveling towards the next.
    let oppositeDirection = new Vector3();
    oppositeDirection.subVectors(startPosition, pathPointVector);
    const raycaster = new Raycaster(pathPointVector, oppositeDirection);
    const intersects = raycaster.intersectObject(this.threejsObject);
    if(intersects.length > 0){
      console.log(`intersects: `, intersects);
      this.startMovingTowardsNextPathVector();
    }

  }

  startMovingTowardsNextPathVector({pathVectors=this.pathVectors, currentPathVectorsIndex=this.currentPathVectorsIndex}={}){
    if(currentPathVectorsIndex >= pathVectors.length - 1){
      console.warn(`no other path vectors for enemy to travel to`);
      return;
    }
    this.currentPathVectorsIndex++;
  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
    signal.unregisterSignals(this);
    clearInterval(this.fireInterval);
  }
}





function createThreejsObjectAndHitbox({componentId, x, y, z}){
  const material = new MeshNormalMaterial();
  const geometry = new CubeGeometry(2, 2, 2);
  geometry.computeBoundingBox();
  const threejsObject = new Mesh(geometry, material);
  threejsObject.position.set(x, y, z);
  threejsObject.name = componentId;//needed for removing from scene
  const hitBox = new Box3().setFromObject(threejsObject);
  return {threejsObject, hitBox};
}