import {BoxGeometry, MeshNormalMaterial, Mesh} from 'three';
import {signal, eventConfig as ec, generateUniqueId} from "core/core";

export default class RotatingBox{
  componentId = generateUniqueId({name:'RotatingBox'})

  constructor({children=[]}={}){
    let geometry = new BoxGeometry(0.2, 0.2, 0.2);
    let material = new MeshNormalMaterial();

    this.threejsObject = new Mesh(geometry, material);
    this.children = children;
    signal.registerSignals(this);
  }
  signals = {
    [ec.hitTest.hitComponent]({componentId, distance, point, face, faceIndex, indices, object}){
      if(this.componentId !== componentId){return;}
      alert('im hit! ' + this.componentId);
    }
  }
  render() {
    this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.02;
  }

  renderChildren({children=this.children}={}){
    children.forEach(c=>c.render());
  }

  addToScene({scene}) {
    this.threejsObject.position.set(0, 0, 0);
    scene.add(this.threejsObject);
    let {componentId, threejsObject} = this;
    signal.trigger(ec.hitTest.registerHittableComponent, {componentId, threejsObject});
  }

  destroy(){

  }

}