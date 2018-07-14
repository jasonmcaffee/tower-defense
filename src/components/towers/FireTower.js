import {LineSegments, LineBasicMaterial, EdgesGeometry, TetrahedronGeometry, MeshNormalMaterial, MeshBasicMaterial, Mesh, Box3, Vector3, Texture, Object3D, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';
import BaseTower from 'components/towers/BaseTower';

/**
 * Should shoot fire bullets
 */
export default class FireTower extends  BaseTower{
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, fireIntervalMs=1000, cost=1, sellPercentage= 0.8, upgradePercentage= 1.5, hitExclusionComponentIds=[], bulletDistancePerSecond} = {}) {
    super({x, y, z, active, hitPoints, fireIntervalMs, cost, sellPercentage, upgradePercentage, hitExclusionComponentIds, bulletDistancePerSecond});
  }

  fireBullet({hitExclusionComponentIds=this.hitExclusionComponentIds, ownerComponentId=this.componentId, distancePerSecond=this.bulletDistancePerSecond}={}={}){
    const startPosition = new Vector3(this.position.x, this.position.y, this.position.z);
    const {nearestEnemy, nearestEnemyPosition, nearestEnemyPreviousPosition, nearestComponentId, distance, direction} = this.getNearestEnemyPositionAndDirection();

    console.log(`FireTower.fireBullet potentially at: `, direction, distance, nearestComponentId);
    if(distance > this.firingRange){
      console.log(`FireTower has an enemy distance: ${distance} that is outside of the range: ${this.firingRange}`);
      return;
    }

    let bullet = new Bullet({direction, startPosition, hitExclusionComponentIds, ownerComponentId, playSound: false, distancePerSecond});
    signal.trigger(ec.stage.addComponent, {component:bullet});
  }
}


//USE TRACKING BULLETS FOR NOW
//fireBullet({hitExclusionComponentIds=this.hitExclusionComponentIds, ownerComponentId=this.componentId, distancePerSecond=this.bulletDistancePerSecond}={}={}){
// const startPosition = new Vector3(this.position.x, this.position.y, this.position.z);
// const {nearestEnemy} = this.getNearestEnemyPositionAndDirection();
// const {} = this.determinePositionEnemyWillBeInNTime({})
//
// let bullet = new Bullet({direction, startPosition, hitExclusionComponentIds, ownerComponentId, playSound: false, distancePerSecond});
// signal.trigger(ec.stage.addComponent, {component:bullet});
// }