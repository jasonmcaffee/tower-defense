import React from 'react';
import 'styles/index.scss';
import * as THREE from 'three';

import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';


export default class App extends React.Component {
  render() {
    return (
      <div id="threeJsRenderDiv">
      </div>
    )
  }

  componentDidMount(){
    signal.registerSignals(this);
    console.log('mounted main app.jsx');
    this.initThreeJs();

  }

  componentWillUnmount(){
    signal.unregisterSignals(this);
  }

  signals = {
    [ec.camera.setPosition]({x, y, z}){
      this.camera.position.set(x, y, z);
    },
    [ec.camera.setLookAt]({x, y, z}){
      this.camera.lookAt(new THREE.Vector3(x, y, z));
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
    }
  }

  initThreeJs(){
    let camera = this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    signal.trigger(ec.camera.setPosition, {x:0, y:0, z:10});
    signal.trigger(ec.camera.setLookAt, {x:0, y:0, z:0});

    let scene = new THREE.Scene();
    let stage = new StageOne();
    stage.addToScene({scene});

    let {innerWidth: width, innerHeight: height} = window;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize(width, height);
    let threeJsRenderDiv = document.getElementById("threeJsRenderDiv");
    threeJsRenderDiv.appendChild( this.renderer.domElement );
    animate({camera, scene, renderer:this.renderer, stage});
  }
}


function animate({camera, scene, renderer, stage}){
  let animationFrameFunc = ()=>{
    stage.render();
    renderer.render(scene, camera);
    requestAnimationFrame(animationFrameFunc)
  };
  animationFrameFunc();
}