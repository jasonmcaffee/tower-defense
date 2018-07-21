import {LineBasicMaterial, MeshNormalMaterial, Vector3, CubeGeometry, Box3, Mesh} from 'three';
import {generateUniqueId, signal, eventConfig as ec} from "core/core";

const style ={
  material:{
    blueMaterial: new LineBasicMaterial({color:0xf44842}),
  },
};

export default class PathPoint{
  componentId = generateUniqueId({name: 'PathPoint'})
  constructor({x=0, y=0, z=0, size=7}={}){
    this.size = size;
    const {threejsObject, hitBox} = createThreejsObjectAndHitbox({x, y, z, componentId: this.componentId, size: this.size});
    this.hitBox = hitBox;
    this.threejsObject = threejsObject;
    signal.registerSignals(this);
  }

  signals={
    [ec.hitTest.hitComponent]({hitComponent, ownerComponentId, damage}) {
      const componentId = hitComponent.componentId;
      if (this.componentId !== componentId) { return; }
    },
  }

  render(){

  }

  addToScene({scene}){
    console.log(`PathPoint addToScene called`, this.threejsObject);
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }

  destroy({scene, componentId=this.componentId}){
    let object3d = scene.getObjectByName(componentId);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {component:this});
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