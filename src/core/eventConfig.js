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
    // registerHitteeComponent: 'hitTest.registerHitteeComponent',
    // unregisterHitteeComponent: 'hitTest.unregisterHitteeComponent',
    hitComponent: 'hitTest.hitComponent', //{hitComponent: 'box123', hitByComponent: 'bullet12359'}
  },
  stage:{
    destroyComponent:'stage.destroyComponent', //{componentId}
  }
}