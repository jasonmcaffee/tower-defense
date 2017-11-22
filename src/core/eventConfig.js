export const eventConfig = {
  mouse:{
    move: "mouse.move",
    mousedown: "mouse.mousedown",
  },
  camera:{
    setPosition: "camera.setPosition",
    setLookAt: "camera.setLookAtVector",
    setLookAtFromMouseMovement: "camera.setLookAtFromMouseMovent",
    moveBackward:"camera.moveBackward",
    moveForward:"camera.moveForward",
    moveLeft:"camera.moveLeft",
    moveRight:"camera.moveRight",
    moveUp:"camera.moveUp",
    moveDown:"camera.moveDown",
  },
  window:{
    resize:"window.resize",
  },
  webworker:{
    message: 'webworker.message',
  },
  webgl:{
    performFrameCalculations: 'webgl.performFrameCalculations', //let all objects know to recalculate for upcoming render.
  },
  hitTest:{
    registerHittableComponent: 'hitTest.registerHittableComponent',//{componentId:'box123', threejsObject: new THREE.Mesh( geometry, material)}
    unregisterHittableComponent:'hitTest.unregisterHittableComponent',//{componentId:'box123'}
    hitComponent: 'hitTest.hitComponent', //{hitComponentId: 'box123', hitByComponentId: 'bullet12359'}
  },
  stage:{
    removeComponentFromScene:'stage.removeComponentFromScene',// {componentId, threejsObject}
    destroyComponent:'stage.destroyComponent', //{componentId}
    componentDestroyed: 'stage.componentDestroyed', //{componentId}
  }
}