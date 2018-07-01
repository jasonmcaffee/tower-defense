import {LineBasicMaterial, Vector3, Geometry, Line, AmbientLight} from 'three';
import {generateUniqueId} from "core/core";

const style ={
  floor:{
    numberOfLines: 200
  },
  material:{
    // blueMaterial: new LineBasicMaterial({color:0x4286f4, transparent:true, opacity:0.3}),
    blueMaterial: new LineBasicMaterial({color:0x4286f4}),
    purpleMaterial: new LineBasicMaterial({color:0x7b42af, transparent:true, opacity:0.3}),
  },
  color:{
    ambientLightColor:  0xffffff,//0x404040
  }
};

/**
 * Floor
 */
export default class Floor {
  lines = []
  children = []
  lights = []
  constructor({children = [], numberOfLines=200, distanceBetweenLines=25, lineLength, drawWallLines=false} = {}) {
    this.children = children;
    this.numberOfLines = numberOfLines;
    this.distanceBetweenLines = distanceBetweenLines;
    this.lineLength = numberOfLines * distanceBetweenLines;

    this.lines = [
      ...this.createFloorLines({material:style.material.blueMaterial}),
    ];
    if(drawWallLines){
      this.lines.push(...this.createWallLines({material:style.material.purpleMaterial}));
    }
    this.lights = this.createLights();
  }

  render() {
    this.renderChildren();
  }

  renderChildren({children = this.children} = {}) {
    children.forEach(c => c.render());
  }

  addToScene({scene}){
    this.addChildrenToScene({scene});
    this.addLinesToScene({scene});
    this.addLightsToScene({scene});
  }

  addChildrenToScene({children = this.children, scene} = {}) {
    children.forEach(c => c.addToScene({scene}));
  }
  addLinesToScene({lines = this.lines, scene}){
    lines.forEach(l => scene.add(l));
  }
  addLightsToScene({lights = this.lights, scene}){
    lights.forEach(l => scene.add(l));
  }

  createLights(){
    let lights = [
      this.createLight({})
    ];
    return lights;
  }

  createFloorLines({numberOfLines=this.numberOfLines, lineLength=this.lineLength, distanceBetweenLines=this.distanceBetweenLines, material}={}){
    let lines = [
      ...this.createVerticalFloorLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines, material}),
      ...this.createHorizontalFloorLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines, material}),
    ];
    return lines;
  }

  createWallLines({numberOfLines=this.numberOfLines, lineLength=this.lineLength, distanceBetweenLines=this.distanceBetweenLines, material}={}){
    let lines = [
      ...this.createVerticalWallLines({numberOfVerticalLines:numberOfLines, lineLength, distanceBetweenLines, material}),
      ...this.createHorizontalWallLines({numberOfHorizontalLines:numberOfLines, lineLength, distanceBetweenLines, material}),
    ];
    return lines;
  }

  createVerticalWallLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5, material}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let yEnd = lineLength / 2;
    let yStart = yEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, y:yStart, y2:yEnd, material}));
    }
    return lines;
  }
  createHorizontalWallLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5, material}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let yStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    yStart += distanceBetweenLines / 2;
    let countXTo = numberOfHorizontalLines * distanceBetweenLines + yStart;
    for(let y=yStart; y < countXTo; y+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd, y:y, y2:y, material}));
    }
    return lines;
  }

  createVerticalFloorLines({numberOfVerticalLines=10, lineLength, distanceBetweenLines=.5, material}={}){
    lineLength = lineLength === undefined ? numberOfVerticalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let zEnd = lineLength / 2;
    let zStart = zEnd * -1;
    let xStart = (numberOfVerticalLines * distanceBetweenLines / 2) * -1  ;
    xStart += distanceBetweenLines / 2;
    let countXTo = numberOfVerticalLines * distanceBetweenLines + xStart;
    for(let x=xStart; x < countXTo; x+=distanceBetweenLines){
      lines.push(this.createLine({x:x, x2:x, z:zStart, z2:zEnd, material}));
    }
    return lines;
  }
  createHorizontalFloorLines({numberOfHorizontalLines = 10, lineLength, distanceBetweenLines=.5, material}={}){
    lineLength = lineLength === undefined ? numberOfHorizontalLines * distanceBetweenLines : lineLength;
    let lines = [];
    let xEnd = lineLength / 2;
    let xStart = xEnd * -1;
    let zStart = (numberOfHorizontalLines * distanceBetweenLines / 2) * -1  ;
    zStart += distanceBetweenLines / 2;
    let countZTo = numberOfHorizontalLines * distanceBetweenLines + zStart;
    for(let z=zStart; z < countZTo; z+=distanceBetweenLines){
      lines.push(this.createLine({x:xStart, x2:xEnd,  z:z, z2:z, material}));
    }
    return lines;
  }

  createLine({x=0, y=0, z=0, x2=0, y2=0, z2=0, material=style.material.blueMaterial}={}){
    let geometry = new Geometry();
    geometry.vertices.push(new Vector3(x, y, z));
    geometry.vertices.push(new Vector3(x2, y2, z2));
    let line = new Line(geometry, material);
    line.name = generateUniqueId({name:'line'});
    return line;
  }

  createLight({x=0, y=0, z=0, color=style.color.ambientLightColor, intensity=1}){
    let thereBeLight = new AmbientLight(color, 0.7);
    return thereBeLight;
  }

  destroy({scene}){
    this.lines.forEach(l=>{
      let object3d = scene.getObjectByName(l.name);
      scene.remove(object3d);
    });
    this.lights.forEach(l=>{
      let object3d = scene.getObjectByName(l.name);
      scene.remove(object3d);
    });
    this.lines = [];
    this.lights = [];

  }
}