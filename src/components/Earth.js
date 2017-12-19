import {BoxGeometry, SphereGeometry, MeshPhongMaterial, MeshLambertMaterial, Mesh, Box3, Vector3, Texture, Object3D, ImageUtils, ShaderLib, UniformsUtils, ShaderMaterial, DoubleSide} from 'three';
import {signal, eventConfig as ec, generateUniqueId, generateRandomNumber as grn} from "core/core";


let standardGeomatry = new SphereGeometry(20, 32, 32);
standardGeomatry.computeBoundingBox();

import earthSurfaceImageSource from 'images/earth/earthSurface.jpg';
import earthSurfaceNormalImageSource from 'images/earth/earthSurfaceNormal.jpg';
import earthAtmosphereImageSource from 'images/earth/earthAtmosphere.png';
import earthSurfaceSpecularImageSource from 'images/earth/earthSurfaceSpecular.jpg';

export default class Earth{
  componentId = generateUniqueId({name:'Earth'})
  hitBox //used to determine if something hit us
  constructor({x=0, y=0, z=200}={}){

    let globeMesh = this.createGlobeMesh();

    this.threejsObject = globeMesh;
    //this.threejsObject = new Object3D();
    //this.threejsObject.add(globeMesh);
    this.hitBox = new Box3().setFromObject(this.threejsObject);

    signal.registerSignals(this);
  }

  createGlobeMesh(){
    let earthSurfaceImage = new Image();
    earthSurfaceImage.src = earthSurfaceImageSource;
    let earthSurfaceTexture = new Texture();
    earthSurfaceTexture.image = earthSurfaceImage;
    earthSurfaceImage.onload = ()=>{
      earthSurfaceTexture.needsUpdate = true;
    };

    let earthAtmosphereImage = new Image();
    earthAtmosphereImage.src = earthAtmosphereImageSource;
    let earthAtmosphereTexture = new Texture();
    earthAtmosphereTexture.image = earthAtmosphereImage;
    earthAtmosphereImage.onload = ()=>{ earthAtmosphereTexture.needsUpdate = true; };

    let geometry   = new SphereGeometry(20, 32, 32);

    //globe
    var material  = new MeshPhongMaterial({map:earthSurfaceTexture});
    var globeMesh = new Mesh(geometry, material)

    //clouds
    var material  = new MeshPhongMaterial({
      map     : earthAtmosphereTexture,
      side        : DoubleSide,
      //opacity     : 0.8,
      transparent : true,
      depthWrite  : false,
    })
    var cloudMesh = new Mesh(geometry, material)
    globeMesh.add(cloudMesh);

    return globeMesh;

  }

  createGlobeMeshOUTDATEDAPI(){
    let earthSurfaceImage = new Image();
    earthSurfaceImage.src = earthSurfaceImageSource;
    let earthSurfaceTexture = new Texture();
    earthSurfaceTexture.image = earthSurfaceImage;
    earthSurfaceImage.onload = ()=>{
      earthSurfaceTexture.needsUpdate = true;
    };

    let shader = ShaderLib["normal"];
    let uniforms = UniformsUtils.clone(shader.uniforms);

    //uniforms["tNormal"].texture = normalMap;
    uniforms.tNormal = {texture:earthSurfaceTexture};
    //uniforms["tSpecular"].texture = specularMap;

    // uniforms["enableDiffuse"].value = true;
    // uniforms["enableSpecular"].value = true;

    let shaderMaterial = new ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms,
        //lights: true
      });
    let globeGeometry = new SphereGeometry(20, 32, 32);
    globeGeometry.computeTangents();

    let globeMesh = new Mesh(globeGeometry, shaderMaterial);
    return globeMesh;

  }


  signals = {
    [ec.hitTest.hitComponent]({hitComponent}){
      let componentId = hitComponent.componentId;
      if(this.componentId !== componentId){return;}
      //signal.trigger(ec.stage.destroyComponent, {componentId});
    }
  }
  render() {
    // this.threejsObject.rotation.x += 0.01;
    this.threejsObject.rotation.y += 0.02;
    //this.threejsObject.rotation.z += 0.01;
    this.hitBox = new Box3().setFromObject(this.threejsObject); //allow for moving box
  }

  addToScene({scene}) {
    scene.add(this.threejsObject);
    signal.trigger(ec.hitTest.registerHittableComponent, {component:this});
  }

  destroy({scene, name=this.threejsObject.name, componentId=this.componentId}){
    let object3d = scene.getObjectByName(name);
    scene.remove(object3d);
    signal.trigger(ec.hitTest.unregisterHittableComponent, {componentId});
  }

}