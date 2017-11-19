import React from 'react';
import 'styles/index.scss';
import * as THREE from 'three';

import StageOne from 'stages/StageOne';

export default class App extends React.Component {
  render() {
    return (
      <div id="threeJsRenderDiv">
      </div>
    )
  }

  componentDidMount(){
    console.log('mounted main app.jsx');
    initThreeJs();
  }
}


function initThreeJs(){
  let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  let scene = new THREE.Scene();

  let stage = new StageOne();
  stage.addToScene({scene});

  let renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  let threeJsRenderDiv = document.getElementById("threeJsRenderDiv");
  threeJsRenderDiv.appendChild( renderer.domElement );
  animate({camera, scene, renderer, stage});
}

function animate({camera, scene, renderer, stage}){
  let animationFrameFunc = ()=>{
    stage.render();
    renderer.render(scene, camera);
    requestAnimationFrame(animationFrameFunc)
  };
  animationFrameFunc();
}