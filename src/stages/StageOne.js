import {Scene, Camera, WebGLRenderer, Raycaster, PerspectiveCamera, Vector3, Vector2} from 'three';
import {eventConfig as ec} from 'core/eventConfig';
import {signal, generateRandomNumber} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';

export default class StageOne {
  camera
  scene
  renderer
  hittableComponents = [] //{componentId:'box123', threejsObject: new THREE.Mesh( geometry, material)}
  rendererDomElement //created during initThreejs and used by react component to append to appropriate div
  constructor({children=[]}={}) {
    signal.registerSignals(this);
    this.setupChildren({children});

    //begin animation after instantiating scene, camera, and renderer.
    this.initThreeJs();
  }

  setupChildren({children=[]}={}){
    this.children = children;
    this.addRotatingBox();

    let min = -20;
    let max = 20;
    let grn = generateRandomNumber;
    for(let i=0; i < 1000; ++i){
      this.addRotatingBox({rotatingBox: new RotatingBox({x:grn({min, max}), y:grn({min, max}), z:grn({min, max})}) });
    }
    this.addFloor();
  }

  initThreeJs(){
    let {width, height} = this.getScreenDimensions();
    let camera = this.camera = new PerspectiveCamera( 70, width / height, 0.01, 10000 );
    signal.trigger(ec.camera.setPosition, {x:0, y:0, z:10});
    signal.trigger(ec.camera.setLookAt, {x:0, y:0, z:0});

    let scene = this.scene = new Scene();
    this.addToScene({scene});

    this.renderer = new WebGLRenderer( { antialias: true } );
    this.renderer.setSize(width, height);

    this.rendererDomElement = this.renderer.domElement;
    animate({camera, scene, renderer:this.renderer, stage:this});
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

  render() {
    this.renderChildren();
  }

  renderChildren({children=this.children}={}){
    let length = children.length - 1;
    while(length >= 0){
      children[length--].render();
    }
  }

  addToScene({scene}) {
    this.addChildrenToScene({scene});
  }

  addChildrenToScene({children=this.children, scene}={}){
    this.children.forEach(c=>c.addToScene({scene}));
  }

  addRotatingBox({rotatingBox = new RotatingBox()}={}){
    this.children.push(rotatingBox);
  }

  addFloor({floor = new Floor()}={}){
    this.children.push(floor);
  }

  getScreenDimensions(){
    let {innerWidth: width, innerHeight: height} = window;
    return {width, height};
  }

  destroy({children=this.children, scene=this.scene}={}){
    signal.unregisterSignals(this);
    children.forEach(c=>c.destroy && c.destroy({scene}));
  }
}


function animate({camera, scene, renderer, stage}){

  let animationFrameFunc = ()=>{
    //signal.trigger(ec.webgl.performFrameCalculations);
    stage.render();
    renderer.render(scene, camera);
    requestAnimationFrame(animationFrameFunc)
  };
  animationFrameFunc();
}