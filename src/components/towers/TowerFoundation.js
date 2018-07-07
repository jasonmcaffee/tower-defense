import {CubeGeometry, BoxGeometry, SphereGeometry, MeshNormalMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D,  Sphere} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";

const towerTypes = {
  fire: {
    type: 'fire',
    damage: 1,
    maxUpgrades: 2,
    level: 1,
    bulletCausesSlownessModifier: 0,
  },
  ice: {
    type: 'fire',
    damage: 1,
    maxUpgrades: 2,
    level: 1,
    bulletCausesSlownessModifier: 0,
  },
  none: {
    type: 'none',
    damage: 0,
    maxUpgrades: 0,
    level: 0,
    bulletCausesSlownessModifier: 0,
  },

};
/**
 * Is what enemies shoot at.
 * Gets towers placed on it.
 */
export default class TowerFoundation{
  componentId = generateUniqueId({name:'TowerFoundation'})
  threejsObject
  hitBox
  tower //various tower types are placed on the foundation
  constructor({x=0, y=0, z=0, size=7, type=towerTypes.fire.type, tower}={}){
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId, size});
    this.hitBox = hitBox;
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
      signal.trigger(ec.towerFoundation.selectedByPlayer, {towerFoundation:this});
    }
  }

  render(){

  }

  getTowerUpgradeInfo({tower=this.tower}={}){
    if(!tower){
      return {isUpgradable: false, upgradeCost: 0, level: 0, sellValue: 0, missingTower: true};
    }
    return tower.getUpgradeInfo();
  }

  //called on when ec.stage.addComponent is triggered with this as the component. (typically done by Level)
  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }
  //called on when ec.stage.destroyComponent is triggered.
  destroy({scene, name=this.threejsObject.name, componentId=this.componentId, tower=this.tower}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    console.log(`destroy TowerFoundation called`, object3d);
    if(tower){
      tower.destroy({scene});
    }
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }
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