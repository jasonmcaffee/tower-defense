import * as THREE from 'three';
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';

export default class StageOne {
  constructor({children=[]}={}) {
    this.children = children;
    this.addRotatingBox();
    this.addFloor();
  }

  render() {
    this.renderChildren();
  }

  renderChildren({children=this.children}={}){
    children.forEach(c=>c.render());
  }

  addToScene({scene}) {
    this.addChildrenToScene({scene});
  }

  addChildrenToScene({children=this.children, scene}={}){
    this.children.forEach(c=>c.addToScene({scene}));
  }

  addRotatingBox({rotatingBox = new RotatingBox()}={}){
    this.children.push(rotatingBox);
  }

  addFloor({floor = new Floor()}={}){
    this.children.push(floor);
  }
}