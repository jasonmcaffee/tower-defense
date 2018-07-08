import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import FireTower from 'components/towers/FireTower';

const fireType = 'fire';
const iceType = 'ice';

/**
 * Is what enemies shoot at.
 * Gets towers placed on it.
 */
export default class TowerFoundation{
  componentId = generateUniqueId({name:'TowerFoundation'})
  threejsObject
  hitBox
  tower //various tower types are placed on the foundation
  constructor({x=0, y=0, z=0, size=7,tower}={}){
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId, size});
    this.hitBox = hitBox; //should always remain the same, based off the original threejsHitBox, so each tower doesn't have to define.
    this.tower = tower;
    this.threejsObject = tower ? tower.threejsObject : threejsObject;//use tower to display if present.
    signal.registerSignals(this);
  }

  signals = {
    //fired when player fires select 'bullet' and determines it hit what it was aiming for
    [ec.player.selectedComponent]({selectedComponent}){
      if(this.componentId !== selectedComponent.componentId){return;}
      console.log(`player selected tower foundation`);
      //let PlayerItems know we've been selected
      signal.trigger(ec.towerFoundation.selectedByPlayer, {towerFoundationId:this.componentId, towerUpgradeInfo: this.getTowerUpgradeInfo() } );
    },

    [ec.towerFoundation.createAndPlaceTower]({towerFoundationId, towerType}={}){
      if(towerFoundationId !== this.componentId){return;}
      console.log(`towerFoundation placing new tower of type: ${towerType}`);
      const towerToPlace = createTowerBasedOnPurchasableTowerConfig({towerType, x: this.threejsObject.position.x, y: this.threejsObject.position.y, z: this.threejsObject.position.z});
      this.switchThreeJsObject({threejsObject: towerToPlace.threejsObject});
    },
  }

  render(){

  }

  switchThreeJsObject({threejsObject, componentId=this.componentId}){
    signal.trigger(ec.stage.destroyComponent, {componentId}); //TODO: getting called after addComponent because of setTimeout
    this.threejsObject = threejsObject;
    signal.trigger(ec.stage.addComponent, {component: this});
  }

  /**
   * Called on when displaying upgrade options to user.
   * @param tower
   * @returns {*}
   */
  getTowerUpgradeInfo({tower=this.tower}={}){
    if(!tower){
      return {isUpgradable: false, upgradeCost: 0, level: 0, sellValue: 0, missingTower: true};
    }
    return tower.getUpgradeInfo();
  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    console.log(`TowerFoundation addToScene for threejsObject: `, this.threejsObject);
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name=this.threejsObject.name, componentId=this.componentId, tower=this.tower}){
    console.log(`TowerFoundation destroy called`);
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    if(tower){
      tower.destroy({scene});
    }
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }
}


function createTowerBasedOnPurchasableTowerConfig({towerType, x, y, z}){
  let result;
  switch(towerType){
    case fireType:
      result = new FireTower({x, y, z });
      break;
    case iceType:
      break;
    default:
      console.error(`unknown tower type: ${towerType}`);
      break;
  }
  return result
}

function createThreejsObjectAndHitbox({componentId, x, y, z, size=7}){
  const material = new MeshNormalMaterial();
  const geometry = new CubeGeometry(size, size, size);
  geometry.computeBoundingBox();
  const threejsObject = new Mesh(geometry, material);
  threejsObject.position.set(x, y, z);
  threejsObject.name = componentId;//needed for removing from scene
  const hitBox = new Box3().setFromObject(threejsObject);
  return {threejsObject, hitBox};
}