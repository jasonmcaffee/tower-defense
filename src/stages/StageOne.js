import {Scene, Camera, WebGLRenderer, Raycaster, PerspectiveCamera, Vector3, Vector2, Projector} from 'three';
import {eventConfig as ec} from 'core/eventConfig';
import {signal, generateRandomNumber} from "core/core";
import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import Bullet from 'components/Bullet';

export default class StageOne {
  camera
  scene
  renderer
  hittableComponents = [] //{componentId:'box123', threejsObject: new THREE.Mesh( geometry, material)}
  rendererDomElement //created during initThreejs and used by react component to append to appropriate div
  children = []
  raycaster = new Raycaster()//used for hit tests
  projector = new Projector()//used for hit tests v2
  constructor({children=[], stageConfig}={}) {
    this.children = children;
    signal.registerSignals(this);
    stageConfig.createChildren({children: this.children});
    //begin animation after instantiating scene, camera, and renderer.
    this.initThreeJs();
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

  hitTestV3({hittableComponents=this.hittableComponents, camera=this.camera, projector=this.projector, clientX, clientY}){
    // let {width, height} = this.getScreenDimensions();
    // let mouseX = (clientX / width) * 2 - 1;
    // let mouseY = - (clientY / height) * 2 + 1;
    // let mouseVector = new Vector3(mouseX, mouseY, 1);
    //
    // projector.unprojectVector(mouseVector, camera);
    //
    // var direction = mouseVector.sub(camera.position).normalize();
    // var ray = new Raycaster(camera.position, direction);
    //
    // let hitComponent;//first object hit by ray
    // let intersects;//raycaster intersectObject result
    // let threejsObjects = hittableComponents.map(h=>h.threejsObject);
    // let allIntersects = ray.intersectObjects(threejsObjects, true);
    //
    // for(let i of allIntersects){
    //   let clickedThreejsObject = i.object;
    //   for(let h of hittableComponents){
    //     if(h.threejsObject.name == clickedThreejsObject.name){
    //       hitComponent = h;
    //       intersects = [i];
    //       break;
    //     }
    //   }
    //   if(hitComponent){
    //     break;
    //   }
    // }
    //
    // if(hitComponent == undefined){return;}
    // return {hitComponent, intersects};
  }

  fireBullet({camera=this.camera, scene=this.scene, projector=this.projector, clientX, clientY}){
    let {width, height} = this.getScreenDimensions();
    let mouseX = (clientX / width) * 2 - 1;
    let mouseY = - (clientY / height) * 2 + 1;
    let mouseVector = new Vector3(mouseX, mouseY, 1);
    projector.unprojectVector(mouseVector, camera);

    let direction = mouseVector.sub(camera.position).normalize();
    let startPosition = camera.position.clone();

    let bullet = new Bullet({direction, startPosition});
    bullet.addToScene({scene});
    this.children.push(bullet);
  }

  signals = {
    [ec.camera.setPosition]({x, y, z}){
      this.camera.position.set(x, y, z);
    },
    [ec.camera.setLookAt]({x, y, z}){
      this.camera.lookAt(new Vector3(x, y, z));
    },
    [ec.camera.setLookAtFromMouseMovement]({x, y, z}){
      //console.log(`setLookAtFromMouseMovement ${x}, ${y}, ${z}`);
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
    [ec.mouse.mousedown]({clientX, clientY, raycaster=this.raycaster}){
      // console.log('checking for hit components...');
      this.fireBullet({clientX, clientY});
      //
      // let {hitComponent, intersects} = this.hitTestV3({clientX, clientY}) || {};
      // if(!hitComponent){return;}
      //
      // console.log(`hit component: ${hitComponent.componentId}`);
      // let {scene} = this;
      // intersects.forEach(i=>{
      //   let {distance, point, face, faceIndex, indices, object} = i;
      //   let {componentId} = hitComponent;
      //   signal.trigger(ec.hitTest.hitComponent, {componentId, distance, point, face, faceIndex, indices, object, scene});
      // })

    },
    //anything that wants to be hittable (e.g. by a bullet) should register via this signal
    [ec.hitTest.registerHittableComponent]({component}){
      this.hittableComponents.push(component);
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
    },
    [ec.stage.destroyComponent]({componentId, scene=this.scene}){
      let component = this.removeChild({componentId});
      signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
      component.destroy({scene});
    }
  }

  removeChild({componentId, children=this.children}){
    let componentIndex = children.findIndex((element)=>{
      return element.componentId === componentId;
    });
    if(componentIndex < 0){return;}
    let removedChild = children.splice(componentIndex, 1)[0];
    return removedChild;
  }
  render({hittableComponents=this.hittableComponents}={}) {
    this.renderChildren({hittableComponents});
  }

  renderChildren({children=this.children, hittableComponents=this.hittableComponents}={}){
    let length = children.length - 1;
    while(length >= 0){
      children[length--].render({hittableComponents});
    }
  }

  addToScene({scene}) {
    this.addChildrenToScene({scene});
  }

  addChildrenToScene({children=this.children, scene}={}){
    //this.children.forEach(c=>c.addToScene({scene}));
    let length = children.length - 1;
    while(length >= 0){
      children[length--].addToScene({scene});
    }
  }

  getScreenDimensions(){
    let {innerWidth: width, innerHeight: height} = window;
    return {width, height};
  }

  destroy({children=this.children, scene=this.scene}={}){
    signal.unregisterSignals(this);
    //children.forEach(c=>c.destroy && c.destroy({scene}));
    let length = children.length - 1;
    try{
      while(length >= 0){
        children[length--].destroy({scene});
      }
    }catch(e){
      console.error(`child ${JSON.stringify(children[length+1])} no destroy`, e);
    }

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