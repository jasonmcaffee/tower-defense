import {eventConfig as ec} from 'core/eventConfig';
import {NewWorker} from "core/WebWorker";


//events
let webWorkerCommands = {
  performHitTest: 'performHitTest',
  registerHittableWebWorkerHitBox: 'registerHittableWebWorkerHitBox',
  unregisterHittableWebWorkerHitBox: 'unregisterHittableWebWorkerHitBox',
  destroy: 'destroy',
  updateComponentHitBox: 'updateComponentHitBox',
};

let webWorkerResultCommands = {
  hitTestResult: 'hitTestResult',
}

export default class HitTestService{
  hitTestWorker
  destroyFuncs=[]
  constructor({signal}){
    this.hitTestWorker = NewWorker(webWorkerBox3HitTest);
    this.signal=signal;
    signal.registerSignals(this);
    this.destroyFuncs.push(function(){
      signal.unregisterSignals(this);
    }.bind(this));

    this.hitTestWorker.onmessage = (e)=>{
      let data = e.data;
      let {command} = data;
      switch(command){
        case webWorkerResultCommands.hitTestResult:{
          signal.trigger(ec.hitTest.hitTestResult, data);
          break;
        }
        default:{
          console.log(`unknown webWorkerResult command ${command}`);
        }
      }
    }
  }
  signals = {
    [ec.hitTest.performHitTest]({hitteeComponent, requestId, hitTestWorker=this.hitTestWorker}){
      let webWorkerHitBox1 = createWebWorkerHitBoxFromComponent({component: hitteeComponent});
      let webWorkerRequest = {command: webWorkerCommands.performHitTest, webWorkerHitBox1};
      hitTestWorker.postMessage(webWorkerRequest);
    },
    [ec.hitTest.destroy]({hitTestWorker=this.hitTestWorker}={}){
      this.destroyFuncs.forEach(df=>df());
      this.destroyFuncs = [];
      hitTestWorker.postMessage({command: webWorkerCommands.destroy});
    },
    [ec.hitTest.registerHittableComponent]({component, hitTestWorker=this.hitTestWorker}){
      let hb = createWebWorkerHitBoxFromComponent({component});
      let {componentId, hitBox} = hb;
      let webWorkerRequest = {command: webWorkerCommands.registerHittableWebWorkerHitBox, componentId, hitBox};
      hitTestWorker.postMessage(webWorkerRequest);
    },
    [ec.hitTest.unregisterHittableComponent]({componentId, hitTestWorker=this.hitTestWorker}){
      let webWorkerRequest = {command: webWorkerCommands.unregisterHittableWebWorkerHitBox, componentId};
      hitTestWorker.postMessage(webWorkerRequest);
    }
  }
}



//this function is turned into a string, then loaded as a web worker.
// no outside references allowed.
//work the worker does when receiving a message
function webWorkerBox3HitTest(){
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/88/three.js');
  let {Box3} = THREE;
  let hittableWebWorkerHitBoxes = [];

  //performs hit tests agains all boxes
  function performHitTest({requestId, webWorkerHitBox1, webWorkerHitBoxes=hittableWebWorkerHitBoxes}){
    let hitteeComponentId = webWorkerHitBox1.componentId;
    let box1box3 = new Box3().set(webWorkerHitBox1.hitBox.min, webWorkerHitBox1.hitBox.max);

    //console.log(`performing hit test for hitteeComponentId: ${hitteeComponentId} against ${webWorkerHitBoxes.length} hittable boxes`);
    let doesIntersect = false;
    let intersectResult = {doesIntersect, hitteeComponentId, hitComponentId:undefined};

    for(let i = 0, len = webWorkerHitBoxes.length; i < len; ++i){
      let webWorkerHitBox2 = webWorkerHitBoxes[i];

      let box2box3 = new Box3().set(webWorkerHitBox2.hitBox.min, webWorkerHitBox2.hitBox.max);
      let doesIntersect = box1box3.intersectsBox(box2box3);
      if(doesIntersect === true){
        let hitComponentId = webWorkerHitBox2.componentId;
        intersectResult.doesIntersect = true;
        intersectResult.hitComponentId = hitComponentId;
        break;
      }
    }
    if(intersectResult.doesIntersect){
      let webWorkerResponse = intersectResult;
      webWorkerResponse.command = 'hitTestResult';
      postMessage(webWorkerResponse);
    }
  }

  function registerHittableWebWorkerHitBox({componentId, hitBox, hitBoxes=hittableWebWorkerHitBoxes}){
    hitBoxes.push({componentId, hitBox});
  }

  function unregisterHittableWebWorkerHitBox({componentId, hitBoxes=hittableWebWorkerHitBoxes}){
    let hitIndex = hitBoxes.findIndex((element)=>{
      return element.componentId === componentId;
    });
    if(hitIndex < 0){return;}
    hitBoxes.splice(hitIndex, 1);//remove hittable component from
  }

  function updateComponentHitBox({componentId, hitBox, hitBoxes=hittableWebWorkerHitBoxes}){
    for(let i = 0, len=hitBoxes.length; i < len; ++i){
      let hb = hitBoxes[i];
      if(hb.componentId == componentId){
        hb.hitBox = hitBox;
        break;
      }
    }
  }

  function destroy(){
    hittableWebWorkerHitBoxes = [];
  }

  onmessage = function(e){
    let data = e.data;
    let command = data.command;

    switch(command){
      case 'performHitTest':{
        performHitTest(data);
        break;
      }
      case 'registerHittableWebWorkerHitBox':{
        registerHittableWebWorkerHitBox(data);
        break;
      }
      case 'unregisterHittableWebWorkerHitBox':{
        unregisterHittableWebWorkerHitBox(data);
        break;
      }
      case 'updateComponentHitBox':{
        updateComponentHitBox(data);
        break;
      }
      case 'destroy':{
        destroy(data);
        break;
      }
      default:{
        console.log(`web worker did not recognize command ${command}`);
      }
    }
  }
}

export function performHittableComponentHitTest({hitteeComponent, hittableComponents=[], requestId}){
  let webWorkerHitBox1 = createWebWorkerHitBoxFromComponent({component: hitteeComponent});
  // let webWorkerHitBoxes = hittableComponents.map(hc=>createWebWorkerHitBoxFromComponent({component:hc}));
  // let webWorkerRequest = {webWorkerHitBox1, webWorkerHitBoxes, requestId};
  // webWorkerRequest = JSON.stringify(webWorkerRequest);
  //console.log(`webWorkerHitBox1`, webWorkerHitBox1);
  let webWorkerRequest = {command: webWorkerCommands.performHitTest, webWorkerHitBox1};
  hitTestWorker.postMessage(webWorkerRequest);

}

function createWebWorkerHitBoxFromComponent({component}){
  let {componentId, hitBox} = component;
  let {min, max} = hitBox;
  let wwHitBox = {
    componentId, hitBox:{min, max}
  }
  return wwHitBox;
}