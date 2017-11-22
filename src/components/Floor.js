import {LineBasicMaterial, Vector3, Geometry, Line} from 'three';

const style ={
  color:{
    neonBlue: 0x4286f4,
    purple: 0x7b42af,
  },
  floor:{
    numberOfLines: 200
  }
}

/**
 * Floor
 */
export default class Floor {
  constructor({children = []} = {}) {
    this.children = children;
    let {numberOfLines} = style.floor;
    this.lines = [
      ...this.createFloorLines({numberOfLines, color: style.color.neonBlue}),
      ...this.createWallLines({numberOfLines, color: style.color.purple}),
    ];
  }

  render() {
    this.renderChildren();
  }

  renderChildren({children = this.children} = {}) {
    //children.forEach(c => c.render());
  }

  addToScene({scene}){
    this.addChildrenToScene({scene});
    this.addLinesToScene({scene});
  }

  addChildrenToScene({children = this.children, scene} = {}) {
    children.forEach(c => c.addToScene({scene}));
  }
  addLinesToScene({lines = this.lines, scene}){
    lines.forEach(l => scene.add(l));
  }

  createFloorLines({numberOfLines=10, lineLength, distanceBetweenLines=.5, color}={}){
    let lines = [
      ...this.createVerticalFloorLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines, color}),
      ...this.createHorizontalFloorLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines, color}),
    ];
    return lines;
  }

  createWallLines({numberOfLines=10, lineLength, distanceBetweenLines=.5, color}={}){
    let lines = [
      ...this.createVerticalWallLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines, color}),
      ...this.createHorizontalWallLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines, color}),
    ];
    return lines;
  }

  createVerticalWallLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5, color}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let yEnd = lineLength / 2;
    let yStart = yEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, y:yStart, y2:yEnd, color}));
    }
    return lines;
  }
  createHorizontalWallLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5, color}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let yStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    yStart += distanceBetweenLines / 2;
    let countXTo = numberOfHorizontalLines * distanceBetweenLines + yStart;
    for(let y=yStart; y < countXTo; y+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd, y:y, y2:y, color}));
    }
    return lines;
  }

  createVerticalFloorLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5, color}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let zEnd = lineLength / 2;
    let zStart = zEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, z:zStart, z2:zEnd, color}));
    }
    return lines;
  }
  createHorizontalFloorLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5, color}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let zStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    zStart += distanceBetweenLines / 2;
    let countZTo = numberOfHorizontalLines * distanceBetweenLines + zStart;
    for(let z=zStart; z < countZTo; z+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd,  z:z, z2:z, color}));
    }
    return lines;
  }

  createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0, color=style.color.neonBlue}={}){
    let material = new LineBasicMaterial({color});
    let geometry = new Geometry();
    geometry.vertices.push(new Vector3(x, y, z));
    geometry.vertices.push(new Vector3(x2, y2, z2));
    return new Line(geometry, material);
  }
}