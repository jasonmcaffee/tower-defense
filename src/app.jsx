import React from 'react';
import 'styles/index.scss';
import * as THREE from 'three';

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
  camera.position.z = 1;

  let scene = new THREE.Scene();

  let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  let material = new THREE.MeshNormalMaterial();

  let mesh = new THREE.Mesh( geometry, material);
  scene.add(mesh);

  let renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  let threeJsRenderDiv = document.getElementById("threeJsRenderDiv");
  threeJsRenderDiv.appendChild( renderer.domElement );
  animate({camera, scene, renderer, mesh});
}

function animate({camera, scene, renderer, mesh}){
  let animationFrameFunc = ()=>{
    //console.log('animation frame');
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animationFrameFunc)
  };
  animationFrameFunc();
}