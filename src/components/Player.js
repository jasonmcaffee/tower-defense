import {BoxGeometry, CubeGeometry, MeshBasicMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, DoubleSide} from 'three';
import {signal, eventConfig as ec, generateUniqueId} from "core/core";
// import Bullet from 'components/Bullet';
import Bullet from 'components/Bullet';

let material = new MeshBasicMaterial({color: 0x4286f4, transparent:true, opacity:0.01});
material.side = DoubleSide;//view box when in box

let standardGeomatry = new CubeGeometry(2, 2, 2);
standardGeomatry.computeBoundingBox();


let style ={
  color:{
    materialHit: 0xff0000,
  }
};

/**
 * issue: perform hit test is returning the first hit component.
 * since the player is hitting itself (it's a hitter and a hittee), we never get the second hit.
 */
export default class Player {
  componentId = generateUniqueId({name: 'Player'})
  hitBox //used to determine if something hit us
  hitPoints
  score = 0 //how many points the player has earned.
  constructor({x = 0, y = 0, z = 0, hitPoints=10, lookAtX=0, lookAtY=0, lookAtZ=0} = {}) {
    let geometry = standardGeomatry;
    this.threejsObject = new Mesh(geometry, material);
    this.threejsObject.position.set(x, y, z);
    this.threejsObject.name = this.componentId;//needed for removing from scene
    this.hitBox = new Box3().setFromObject(this.threejsObject);
    signal.registerSignals(this);

    signal.trigger(ec.camera.setPosition, {x, y, z});//move the camera to where the player is. a bit messy right now..
    //signal.trigger(ec.camera.setLookAt, {x: lookAtX, y:lookAtY, z:lookAtZ}); //todo: NOT WORKING

    this.hitExclusionComponentId = this.componentId;//so you can't hit yourself while moving.
  }

  signals = {
    //when player clicks on the screen, we fire a selection bullet. if the selection bullet hits hittable components we send a new signal
    //to indicate the player has selected something.
    [ec.hitTest.hitComponent]({hitComponent, damage, ownerComponentId, hitByComponent}) {
      let componentId = hitComponent.componentId;
      //check
      if (this.componentId !== componentId) {
        if(ownerComponentId !== this.componentId){return;}

        if(hitByComponent.isPlayerSelectItem){ //bullets fired on click get this property added to them.
          console.log(`player selected item: `, hitComponent);
          signal.trigger(ec.player.selectedComponent, {selectedComponent: hitComponent});
        }
        return;
      }
    },
    //see if we hit anything while moving.e.g earth
    [ec.hitTest.hitTestResult]({doesIntersect, hitteeComponentId, hitComponentId, damage=this.damage}){
      if(this.componentId !== hitteeComponentId || this.hitExclusionComponentId === hitComponentId){return;}
      this.hasHit = true;
      console.log(`player has hit something ${hitteeComponentId}  ${hitComponentId}`);
      this.moveInOppositeDirection();
    },
    //follow the camera
    [ec.camera.positionChanged]({x, y, z, componentId=this.componentId}){
      console.log(`player ec.camera.positionChanged`);
      this.threejsObject.position.set(x, y, z);
      this.hitBox = new Box3().setFromObject(this.threejsObject);
      signal.trigger(ec.player.positionChanged, {x, y, z});//move the galaxy
      signal.trigger(ec.enemy.targetPositionChanged, {x, y, z, componentId});
      signal.trigger(ec.hitTest.updateComponentHitBox, {component:this});

      this.performHitTest();
    },
    [ec.stage.mouseClickedOnStage]({camera, cameraPosition, clientX, clientY, projector, width, height, cursorX, cursorY}){
      console.log(`player ec.stage.mouseClickedOnStage`);
      this.fireSelectItemBullet();
    },
    //keep track of which direction the mouse is pointing so we can cast rays in that direction and determine if the player selected something
    [ec.cursor.mousexyzChanged]({x, y, z, direction}){
      // console.log(`player ec.cursor.mousexyzChanged`);
      this.mouseVector = new Vector3(x, y, z);
      this.mouseDirection = direction; //so we can fire bullets.
    }
  }

  moveInOppositeDirection({currentDirection=this.mouseDirection, currentPosition=this.threejsObject.position, distance=-2}={}){
    //console.log(`old position is x: ${currentPosition.x}  y: ${currentPosition.y} z: ${currentPosition.z}`);
    let newPosition = new Vector3().copy(currentDirection).normalize().multiplyScalar(distance);
    this.threejsObject.position.add(newPosition);
    //console.log(`new position is x:${this.threejsObject.position.x} y: ${this.threejsObject.position.y} z: ${this.threejsObject.position.z}`);
    signal.trigger(ec.camera.setPosition, this.threejsObject.position);
  }

  playHitAnimation({hitPoints=this.hitPoints, threejsObject=this.threejsObject, intervalMs=100, maxIntervalCount=2, hitColor=style.color.materialHit}={}){
    if(this.playingHitAnimation){return;}
    this.playingHitAnimation = true;
    console.log('player hit animation');
  }
  fireSelectItemBullet(){
    // console.log(`player fire bullet. `, this.mouseDirection);
    if(!this.mouseDirection){return;}
    let direction = this.mouseDirection;
    let startPosition = this.mouseVector;

    let bullet = new Bullet({direction, startPosition, hitExclusionComponentId:this.componentId, ownerComponentId:this.componentId, playSound: false, distancePerSecond:3000});
    bullet.isPlayerSelectItem = true;
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }

  render() {
    this.hitBox = new Box3().setFromObject(this.threejsObject); //allow for moving box

  }

  performHitTest({hitteeComponent=this}={}){
    signal.trigger(ec.hitTest.performHitTest, {hitteeComponent});
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component: this});
  }

  destroy({scene, name = this.threejsObject.name, componentId = this.componentId}) {
    signal.unregisterSignals(this);
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }

}