import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";
import FireTower from 'components/towers/FireTower';

const fireType = 'fire';
const iceType = 'ice';

//which towers can be placed on this tower foundation
function getDefaultPurchasableTowers(){
  return [
    {cost: 20, label:fireType, type: fireType, enabled: true,},
    {cost: 30, label:iceType, type: iceType, enabled: true},
  ];
}

/**
 * Is what enemies shoot at.
 * Gets towers placed on it.
 */
export default class TowerFoundation{
  componentId = generateUniqueId({name:'TowerFoundation'})
  threejsObject
  hitBox
  tower //various tower types are placed on the foundation
  constructor({x=0, y=0, z=0, size=7,tower, purchasableTowers=getDefaultPurchasableTowers()}={}){
    this.size = size;
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId, size: this.size});
    this.hitBox = hitBox; //should always remain the same, based off the original threejsHitBox, so each tower doesn't have to define.
    this.tower = tower;
    this.threejsObject = tower ? tower.threejsObject : threejsObject;//use tower to display if present.
    this.purchasableTowers = purchasableTowers;
    signal.registerSignals(this);

    signal.trigger(ec.playerItems.purchasableTowersChanged, {purchasableTowers});//not sure this is needed.
  }

  signals = {
    //fired when player fires select 'bullet' and determines it hit what it was aiming for
    [ec.player.selectedComponent]({selectedComponent}){
      if(this.componentId !== selectedComponent.componentId){return;}
      console.log(`player selected tower foundation`);
      //let PlayerItems know we've been selected
      signal.trigger(ec.towerFoundation.selectedByPlayer, {towerFoundationId:this.componentId, towerUpgradeInfo: this.getTowerUpgradeInfo(), purchasableTowers: this.purchasableTowers } );
    },

    [ec.towerFoundation.createAndPlaceTower]({towerFoundationId, towerType, cost}={}){
      if(towerFoundationId !== this.componentId){return;}
      console.log(`towerFoundation placing new tower of type: ${towerType}`);
      const towerToPlace = createTowerBasedOnPurchasableTowerConfig({towerType, x: this.threejsObject.position.x, y: this.threejsObject.position.y, z: this.threejsObject.position.z, cost});
      this.switchThreeJsObject({threejsObject: towerToPlace.threejsObject});
      this.tower = towerToPlace;
      signal.trigger(ec.towerFoundation.towerUpgradeInfoChanged, {towerFoundationId:this.componentId, towerUpgradeInfo: this.getTowerUpgradeInfo(), purchasableTowers: this.purchasableTowers } );
      this.disablePurchasableTowers();
    },

    [ec.towerFoundation.destroyTower]({towerFoundationId}){
      if(towerFoundationId !== this.componentId){return;}
      console.log(`towerFoundation destroying tower`);
      const {threejsObject} = createThreejsObjectAndHitbox({x: this.x, y: this.y, z: this.z, componentId: this.componentId, size: this.size});
      this.switchThreeJsObject({threejsObject});
      this.enablePurchasableTowers();
      signal.trigger(ec.towerFoundation.towerUpgradeInfoChanged, {towerFoundationId:this.componentId, towerUpgradeInfo: this.getTowerUpgradeInfo(), purchasableTowers: this.purchasableTowers } );
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



  //when a tower is purchased the upgrade menu should not allow you to buy more (should have to sell first)
  disablePurchasableTowers({purchasableTowers=this.purchasableTowers}={}){
    purchasableTowers.forEach(pt=>pt.enabled=false);
    signal.trigger(ec.playerItems.purchasableTowersChanged, {purchasableTowers});
  }
  enablePurchasableTowers({purchasableTowers=this.purchasableTowers}={}){
    purchasableTowers.forEach(pt=>pt.enabled=true);
    signal.trigger(ec.playerItems.purchasableTowersChanged, {purchasableTowers});
  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    console.log(`TowerFoundation addToScene for threejsObject: `, this.threejsObject);
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, componentId=this.componentId, tower=this.tower}){
    console.log(`TowerFoundation destroy called for name: ${name}`);
    let object3d = scene.getObjectByName(componentId);
    scene.remove(object3d);
    if(tower){
      tower.destroy({scene});
      this.tower = null;
    }
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }
}


function createTowerBasedOnPurchasableTowerConfig({towerType, x, y, z, cost}){
  let result;
  switch(towerType){
    case fireType:
      result = new FireTower({x, y, z, cost });
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