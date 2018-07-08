import {LineSegments, LineBasicMaterial, EdgesGeometry, TetrahedronGeometry, MeshNormalMaterial, MeshBasicMaterial, Mesh, Box3, Vector3, Texture, Object3D, Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import Bullet from 'components/Bullet';
import BaseTower from 'components/towers/BaseTower';

/**
 * Should shoot fire bullets
 */
export default class FireTower extends  BaseTower{
  componentId = generateUniqueId({name: 'FireTower'}) //needed for hit test ownerId on bullets.
  constructor({x = 0, y = 0, z = 0, active=true, hitPoints=10, fireIntervalMs=1000, cost=1, sellPercentage= 0.8, upgradePercentage= 1.5} = {}) {
    super({x, y, z, active, hitPoints, fireIntervalMs, cost, sellPercentage, upgradePercentage});
  }

  //called on by TowerFoundation
  upgrade(){
    this.level++;//todo: fireinterval, bullet damage, etc
  }
}