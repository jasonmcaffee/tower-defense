import * as THREE from 'three';

export default class RotatingBox{
  constructor({children=[]}={}){
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    this._threeObject = new THREE.Mesh( geometry, material);
    this._children = children;
  }
  render() {
    this._threeObject.rotation.x += 0.01;
    this._threeObject.rotation.y += 0.02;
  }

  renderChildren({children=this._children}={}){
    children.forEach(c=>c.render());
  }

  addToScene({scene}) {
    this._threeObject.position.set(0, 0, 0);
    scene.add(this._threeObject);
    this.addChildrenToScene({scene});

  }


  addChildrenToScene({children=this._children, scene}={}){
    this._children.forEach(c=>scene.add(c.threeObject));
  }
}