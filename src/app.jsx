import React from 'react';
import 'styles/index.scss';
//import * as THREE from 'three';
import {Scene, Vector3, Vector2, PerspectiveCamera, WebGLRenderer, Raycaster} from 'three';

import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';


export default class App extends React.Component {
  render() {
    return (
      <div>
        <div id="follower">
          <div id="circle1"></div>
          <div id="circle2"></div>
        </div>
        <div id="threeJsRenderDiv">
        </div>
      </div>

    )
  }

  componentDidMount(){
    signal.registerSignals(this);
    console.log('mounted main app.jsx');
    this.initThreeJs();
    this.initCursor();
    this.requestFullScreen();
  }

  componentWillUnmount(){
    signal.unregisterSignals(this);
  }

  signals = {
    [ec.camera.setPosition]({x, y, z}){
      this.camera.position.set(x, y, z);
    },
    [ec.camera.setLookAt]({x, y, z}){
      this.camera.lookAt(new Vector3(x, y, z));
    },
    [ec.camera.setLookAtFromMouseMovement]({x, y, z}){
      x += this.camera.position.x;
      y += this.camera.position.y;
      z += this.camera.position.z;
      signal.trigger(ec.camera.setLookAt, {x,y,z});
    },
    [ec.camera.moveBackward]({amount=0}={}){
      this.camera.translateZ(amount);
    },
    [ec.camera.moveForward]({amount=0}={}){
      this.camera.translateZ(- amount);
    },
    [ec.camera.moveLeft]({amount=0}={}){
      this.camera.translateX(- amount);
    },
    [ec.camera.moveRight]({amount=0}={}){
      this.camera.translateX(amount);
    },
    [ec.camera.moveUp]({amount=0}={}){
      this.camera.translateY(amount);
    },
    [ec.camera.moveDown]({amount=0}={}){
      this.camera.translateY(- amount);
    },
    [ec.window.resize]({height, width}){
      let {camera, renderer} = this;
      let aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    },

    //hit test
    //all registered hittable components will be evaluated to determine if the mouse x, y coordinates intersect/hit.
    //https://threejs.org/docs/#api/core/Raycaster
    [ec.mouse.mousedown]({clientX, clientY}){
      //hit test
      //you'll want each child in scene to return their collidable "box"
      let {width, height} = this.getScreenDimensions();
      let mouseX = (clientX / width) * 2 - 1;
      let mouseY = (clientY / height) * 2 - 1;
      let mouseVector = new Vector2(mouseX, mouseY);

      let raycaster = new Raycaster();
      raycaster.setFromCamera(mouseVector, this.camera);

      console.log('checking for hit components...');
      let hitComponent;//first object hit by ray
      let intersects;//raycaster intersectObject result
      for (let hittableComponent of this.hittableComponents){
        let {componentId, threejsObject} = hittableComponent;
        intersects = raycaster.intersectObject(threejsObject);
        if(intersects && intersects.length > 0){
          hitComponent = hittableComponent;
          console.log(`hit component: ${hitComponent.componentId}`);
          break;
        }
      }
      if(hitComponent == undefined){return;}
      let firstIntersect = intersects[0]; //[ { distance, point, face, faceIndex, indices, object }, ... ]
      let {distance, point, face, faceIndex, indices, object} = firstIntersect;
      let {componentId} = hitComponent;
      signal.trigger(ec.hitTest.hitComponent, {componentId, distance, point, face, faceIndex, indices, object, scene:this.scene});

    },
    //anything that wants to be hittable (e.g. by a bullet) should register via this signal
    [ec.hitTest.registerHittableComponent]({componentId, threejsObject}){
      this.hittableComponents.push({componentId, threejsObject});
    },
    [ec.hitTest.unregisterHittableComponent]({componentId}){
      let hitIndex = this.hittableComponents.findIndex((element)=>{
        return element.componentId === componentId;
      });
      if(hitIndex < 0){return;}
      this.hittableComponents.splice(hitIndex, 1);//remove hittable component from array
    },
    [ec.stage.componentDestroyed]({componentId, threejsObject}){
      signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
    }
  }

  hittableComponents = [] //{componentId:'box123', threejsObject: new THREE.Mesh( geometry, material)}

  initThreeJs(){
    let camera = this.camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10000 );
    signal.trigger(ec.camera.setPosition, {x:0, y:0, z:10});
    signal.trigger(ec.camera.setLookAt, {x:0, y:0, z:0});

    let scene = this.scene = new Scene();
    let stage = new StageOne();
    stage.addToScene({scene});

    let {width, height} = this.getScreenDimensions();
    this.renderer = new WebGLRenderer( { antialias: true } );
    this.renderer.setSize(width, height);
    let threeJsRenderDiv = document.getElementById("threeJsRenderDiv");
    threeJsRenderDiv.appendChild( this.renderer.domElement );
    animate({camera, scene, renderer:this.renderer, stage});
  }

  //todo: pointer lock https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
  initCursor({movementsPerSecond=120}={}){
    let cursorElement = document.getElementById('follower');
    let x, y;
    let intervalMs = 1000/movementsPerSecond;
    window.onmousemove = (e)=>{
      x = e.clientX;
      y = e.clientY;

    }
    setInterval(function(){
      cursorElement.style.top = y + 'px';
      cursorElement.style.left = x + 'px';
    }, intervalMs)
  }

  requestFullScreen(){
    function handleInitialFullScreenRequestBegin(){
      var el = document.documentElement,
        rfs = el.requestFullscreen
          || el.webkitRequestFullScreen
          || el.mozRequestFullScreen
          || el.msRequestFullscreen
      ;

      rfs.call(el);
      document.body.removeEventListener('mousedown', handleInitialFullScreenRequestBegin);
    }
    //document.body.addEventListener('mousedown', handleInitialFullScreenRequestBegin, false);
  }

  getScreenDimensions(){
    let {innerWidth: width, innerHeight: height} = window;
    return {width, height};
  }
}



function animate({camera, scene, renderer, stage}){
  let animationFrameFunc = ()=>{
    signal.trigger(ec.webgl.performFrameCalculations);
    stage.render();
    renderer.render(scene, camera);
    requestAnimationFrame(animationFrameFunc)
  };
  animationFrameFunc();
}