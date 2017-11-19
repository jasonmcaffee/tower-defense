import * as THREE from 'three';
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';

export default class StageOne {
  constructor({children=[]}={}) {
    this._children = children;
    this.addRotatingBox();
    this.addFloor();
  }

  render() {
    this.renderChildren();
  }

  renderChildren({children=this._children}={}){
    children.forEach(c=>c.render());
  }

  addToScene({scene}) {
    this.addChildrenToScene({scene});
  }

  addChildrenToScene({children=this._children, scene}={}){
    this._children.forEach(c=>c.addToScene({scene}));
  }

  addRotatingBox({rotatingBox = new RotatingBox()}={}){
    this._children.push(rotatingBox);
  }

  addFloor({floor = new Floor()}={}){
    this._children.push(floor);
  }
}