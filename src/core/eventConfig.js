export const eventConfig = {
  mouse:{
    move: "mouse.move",
    mousedown: "mouse.mousedown",
  },
  cursor:{
    mousexyzChanged:'cursor.mousexyzChanged', //only calc the x, y, z once.
  },
  controls:{
    reset:'controls.reset', //reset things like lat, lon, so when a new screen is splayed we can start fresh with lookAt camera
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
    moveMultiDirection:"camera.moveMultiDirection", //{camera.moveDown:.1, camera.moveUp:.1}
    positionChanged:"camera.positionChanged", //let player hitbox follow
    attachAudioListenerToCamera:"camera.attachAudioListenerToCamera"
  },
  window:{
    resize:"window.resize",
  },
  webworker:{
    message: 'webworker.message',

    // registerHittableWebWorkerHitBox : 'webworker.registerHittableWebWorkerHitBox',
    // unregisterHittableWebWorkerHitBox: 'webworker.unregisterHittableWebWorkerHitBox',
    destroy: 'webworker.destroy',
    destroyAllWorkers: 'webworker.destroyAllWorkers',
  },
  webgl:{
    performFrameCalculations: 'webgl.performFrameCalculations', //let all objects know to recalculate for upcoming render.
  },
  hitTest:{
    hitTestResult: 'webworker.hitTestResult',
    performHitTest: 'webworker.performHitTest',
    registerHittableComponent: 'hitTest.registerHittableComponent',//{componentId:'box123', threejsObject: new THREE.Mesh( geometry, material)}
    unregisterHittableComponent:'hitTest.unregisterHittableComponent',//{componentId:'box123'}
    // registerHitteeComponent: 'hitTest.registerHitteeComponent',
    // unregisterHitteeComponent: 'hitTest.unregisterHitteeComponent',
    hitComponent: 'hitTest.hitComponent', //{hitComponent: 'box123', hitByComponent: 'bullet12359'}
    updateComponentHitBox: 'hitTest.updateComponentHitBox', //when move {component}
  },
  stage:{
    destroyComponent:'stage.destroyComponent', //{componentId}
    addComponent:'stage.addComponent', //for adding dynamic stuff from components. e.g. fire bullet
    mouseClickedOnStage:'stage.mouseClickedOnStage'//pass camera position and mouse coordinates so player can fire bullet.
  },
  player:{
    positionChanged:'player.positionChanged',//let enemies know where you are
    hitPointsChanged: 'player.hitPointsChanged',
    died: 'player.died',
    scoreChanged:'player.scoreChanged',
    selectedComponent: 'player.selectedComponent', //when player clicks on screen in order to select TowerFoundation, etc. {selectedComponent}
  },
  towerFoundation:{
    selectedByPlayer: 'towerFoundation.selectedByPlayer', //when player.selectedComponent is towerFoundation. {towerFoundation}
    createAndPlaceTower: 'towerFoundation.createAndPlaceTower', //when user purchases a tower
    towerUpgradeInfoChanged: 'towerFoundation.towerUpgradeInfoChanged', //after we purchase/sell/upgrade, we want the upgrade menu to be updated.
    destroyTower: 'towerFoundation.destroyTower', //when tower is sold
  },
  towerUpgradeMenu:{
    show: 'towerUpgradeMenu.show',
    hide: 'towerUpgradeMenu.hide',
    upgradeTowerButtonClicked: 'towerUpgradeMenu.upgradeTowerButtonClicked',
    sellTowerButtonClicked: 'towerUpgradeMenu.sellTowerButtonClicked',
    purchaseTowerClicked: 'towerUpgradeMenu.purchaseTowerClicked'
  },
  level:{
    completed: 'level.completed',
  },
  enemyWave:{
    beginWave: 'enemyWave.beginWave',
    endWave: 'enemyWave.endWave',
    waveEnded: 'enemyWave.waveEnded',
    waveBegan: 'enemyWave.waveBegan',
  },
  playerItems:{
    purchasableTowersChanged: 'playerItems.purchasableTowersChanged', //so menu knows what's available {purchasableTowers:[]}
    playerCoinsChanged: 'playerItems.playerCoinsChanged',
  },
  earth:{
    hitPointsChanged: 'earth.hitPointsChanged',
    died: 'earth.died',
    doneExploding: 'earth.doneExploding', //we don't want any remnant bullets firing when we start new game.
  },
  enemy:{
    died: 'enemy.died', //so game config can determine if game ended.
    targetPositionChanged: 'enemy.target.positionChanged', //for earth, player, etc. lets enemies know where there targets are.
    reachedEndOfPath: 'enemy.reachedEndOfPath', //let enemy wave know
    positionChanged: 'enemy.positionChanged',
  },
  game:{
    startGame:'game.startGame',
    stopGame:'game.stopGame',
    gameEnded:'game.gameEnded',
  }
}