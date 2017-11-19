import {LineBasicMaterial, Vector3, Geometry, Line} from 'three';

/**
 * Floor
 */
export default class Floor {
  constructor({children = []} = {}) {
    this._children = children;
    this.lines = [
      ...this.createFloorLines({numberOfLines:30}),
      ...this.createWallLines({numberOfLines:30}),
    ];
  }

  render() {
    this.renderChildren();
  }

  renderChildren({children = this._children} = {}) {
    //children.forEach(c => c.render());
  }

  addToScene({scene}){
    this.addChildrenToScene({scene});
    this.addLinesToScene({scene});
  }

  addChildrenToScene({children = this._children, scene} = {}) {
    children.forEach(c => c.addToScene({scene}));
  }
  addLinesToScene({lines = this.lines, scene}){
    lines.forEach(l => scene.add(l));
  }

  createFloorLines({numberOfLines=10, lineLength, distanceBetweenLines=.5}={}){
    let lines = [
      ...this.createVerticalFloorLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines}),
      ...this.createHorizontalFloorLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines}),
    ];
    return lines;
  }

  createWallLines({numberOfLines=10, lineLength, distanceBetweenLines=.5}={}){
    let lines = [
      ...this.createVerticalWallLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines}),
      ...this.createHorizontalWallLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines}),
    ];
    return lines;
  }

  createVerticalWallLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let yEnd = lineLength / 2;
    let yStart = yEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, y:yStart, y2:yEnd}));
    }
    return lines;
  }
  createHorizontalWallLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let yStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    yStart += distanceBetweenLines / 2;
    let countXTo = numberOfHorizontalLines * distanceBetweenLines + yStart;
    for(let y=yStart; y < countXTo; y+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd, y:y, y2:y}));
    }
    return lines;
  }

  createVerticalFloorLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let zEnd = lineLength / 2;
    let zStart = zEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, z:zStart, z2:zEnd}));
    }
    return lines;
  }
  createHorizontalFloorLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let zStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    zStart += distanceBetweenLines / 2;
    let countZTo = numberOfHorizontalLines * distanceBetweenLines + zStart;
    for(let z=zStart; z < countZTo; z+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd,  z:z, z2:z}));
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