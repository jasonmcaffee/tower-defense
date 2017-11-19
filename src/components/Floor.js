import {LineBasicMaterial, Vector3, Geometry, Line} from 'three';

/**
 * Floor
 */
export default class Floor {
  constructor({children = []} = {}) {
    this._children = children;

    // let material = new LineBasicMaterial({ color: 0x4286f4 });
    // let geometry = new Geometry();
    // geometry.vertices.push(new Vector3(-10, 1, 0));
    // geometry.vertices.push(new Vector3(10, 1, 0));
    // this.line = new Line(geometry, material);
    this.lines = this.createLines();
  }

  render() {
    //console.log('rendering floor');
    this.renderChildren();
  }

  renderChildren({children = this._children} = {}) {
    //children.forEach(c => c.render());
  }

  addToScene({scene}) {
    //scene.add(this.line);
    this.addChildrenToScene({scene});
    this.addLinesToScene({scene});

  }

  addChildrenToScene({children = this._children, scene} = {}) {
    children.forEach(c => c.addToScene({scene}));
  }
  addLinesToScene({lines = this.lines, scene}){
    lines.forEach(l => scene.add(l));
  }

  createLines({numberOfVerticalLines=10, numberOfHorizontalLines=10, lineLength=10, distanceBetweenLines=1}={}){
    let lines = [];
    //vertical lines
    let yEnd = lineLength / 2;
    let yStart = yEnd * -1;
    let xStart = (numberOfVerticalLines / 2) * -1;
    for(let x=xStart; x < (numberOfVerticalLines + xStart); x+=distanceBetweenLines){
      console.log('drawing line x ', x);
      lines.push(this.createLine({x:x, x2:x, y:yStart, y2:yEnd}));
    }

    return lines;
  }

  createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0}={}){
    let material = new LineBasicMaterial({ color: 0x4286f4 });
    let geometry = new Geometry();
    geometry.vertices.push(new Vector3(x, y, z));
    geometry.vertices.push(new Vector3(x2, y2, z2));
    return new Line(geometry, material);
  }
}