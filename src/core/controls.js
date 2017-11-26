import {eventConfig as ec} from "core/eventConfig";
import {signal} from "core/core";
import {Clock, Math as threeMath} from "three";

let lookClock = new Clock();
// let moveRightClock = new Clock();
// let moveLeftClock = new Clock();
// let moveUpClock = new Clock();
// let moveDownClock = new Clock();
// let moveForwardClock = new Clock();
// let moveBackwardClock = new Clock();
let moveClock = new Clock();

let qwertyKeyCodeOrder = [
  // 1   2   3   4   5   6   7   8   9   0  -    =    delete
  49, 50, 51, 52, 53, 54, 55, 56, 57,   48, 189, 187, 8,
  // q   w   e   r   t   y   u   i   o   p  [    ]    \
  81, 87, 69, 82, 84, 89, 85, 73, 79,   80, 219, 221, 220,
  // a   s   d   f   g   h   j   k   l  ;    '    Enter
  65, 83, 68, 70, 71, 72, 74, 75,   76, 186, 222, 13,
  // z   x   c   v   b   n   m  ,    .     /
  90, 88, 67, 86, 66, 78,   77, 188, 190,  191
];

let {moveForward, moveBackward, moveLeft, moveRight, moveUp, moveDown} = ec.camera;

//start listening for keyboard, window, mouse movements, etc.
export function listen(){
  listenKeyboard();
  listenMouse();
  listenWindow();
  //controls.startMouseInterval();
  signal.registerSignals(controls);
}

//control camera position
let controls = {
  //how far to move the camera in a given direction
  moveAmount: .2,
  moveDistancePerSecond: 10 ,
  //storage for keys that are currently pressed, and their associated interval id.
  //key should only be given one interval (started when key is first pressed, stopped when key is released)
  keysCurrentlyPressed: {key:undefined, intervalId:undefined},
  stopLookingWithMouse: false, //when mouse leaves window, this will be set to true

  mouseMoved({pageX, pageY, height=window.innerHeight, width=window.innerWidth}){
    this.mouseX = pageX - (width/2);
    this.mouseY = pageY - (height/2);
  },
  signals:{
    [ec.webgl.performFrameCalculations](){
      this.performLookAtBasedOnMouseMovement();
      this.performMovementBasedOnKeysPressed();
    }
  },
  performLookAtBasedOnMouseMovement({lookSpeed=0.1, mouseX=this.mouseX, mouseY=this.mouseY}={}){
    if(this.stopLookingWithMouse){return;}
    let delta = lookClock.getDelta();
    //console.log('delta is ', delta);
    //look
    var actualLookSpeed = delta * lookSpeed;
    var verticalLookRatio = 1;
    if(isNaN(this.lon)){
      this.lon = 0;
    }
    if(isNaN(this.lat)){
      this.lat = 0;
    }
    this.lon += mouseX * actualLookSpeed;
    //if( this.lookVertical )
    this.lat -= mouseY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
    this.phi = threeMath.degToRad( 90 - this.lat );

    this.theta = threeMath.degToRad( this.lon );

    this.xyz = {
      x: 100 * Math.sin( this.phi ) * Math.cos(this.theta),
      y: 100 * Math.cos( this.phi ),
      z: 100 * Math.sin( this.phi ) * Math.sin( this.theta )
    };
    if(isNaN(this.xyz.x)){
      return;
    }
    signal.trigger(ec.camera.setLookAtFromMouseMovement, this.xyz);
  },

  //stop controlling camera position
  keyReleased({keyReleased, keyCode}){
    let key = keyCode + '';
    delete this.keysCurrentlyPressed[key];
  },

  //control the camera position
  keyPressed({keyPressed, keyCode}){
    console.log('keypressed, keycode', keyPressed, keyCode);
    if(keyCode === 70){
      requestFullScreen();
      return;
    }
    let key = keyCode + '';
    this.keysCurrentlyPressed[key] = {keyPressed, keyCode, clock:new Clock()};
  },

  performMovementBasedOnKeysPressed({amount=this.moveAmount}={}){
    for(let key in this.keysCurrentlyPressed){
      let keyInfo = this.keysCurrentlyPressed[key];
      if(keyInfo == undefined){continue;}
      let {keyPressed, keyCode, clock} = keyInfo;
      this.performMovementBasedOnKeyPressed({keyPressed, keyCode, clock});
    }
  },

  keyCodeToCameraMovementMap:{
    'w': moveForward,
    's': moveBackward,
    'a':moveLeft,
    'd':moveRight,
    [32]:moveUp,//spacebar
    [38]:moveUp, //up arrow
    [16]:moveDown, //left shift
    [40]:moveDown, //down arrow
    [39]:moveRight, //right arrow
    [37]:moveLeft, //left arrow
  },
  performMovementBasedOnKeyPressed({keyCodeToCameraMovementMap=this.keyCodeToCameraMovementMap, keyPressed, keyCode, moveDistancePerSecond=this.moveDistancePerSecond, clock}){
    let event = keyCodeToCameraMovementMap[keyPressed.toLowerCase()] || keyCodeToCameraMovementMap[keyCode];
    if(!event){return;}
    let delta = clock.getDelta();
    // let delta=moveClock.getDelta();
    // let delta;
    // switch(event){
    //   case moveUp: delta = moveLeftClock.getDelta(); break;
    //   case moveDown: delta = moveDownClock.getDelta(); break;
    //   case moveLeft: delta = moveLeftClock.getDelta();break;
    //   case moveRight: delta = moveRightClock.getDelta();break;
    //   case moveForward: delta = moveForwardClock.getDelta(); break;
    //   case moveBackward: delta = moveBackwardClock.getDelta(); break;
    // }
    // if(delta == undefined){return;}
    let amount = moveDistancePerSecond * delta;
    signal.trigger(event, {amount});
  }

};

function listenWindow(){
  window.addEventListener("resize", (e)=>{
    let height = window.innerHeight;
    let width = window.innerWidth;
    signal.trigger(ec.window.resize, {height, width});
  });
}

function listenMouse(){
  document.onmousemove = (e)=>{
    if(controls.stopLookingWithMouse){return;}
    let {clientX, clientY, pageX, pageY} = e;
    //console.log(`mouse move x:${x} y:${y}`);
    controls.mouseMoved({clientX, clientY, pageX, pageY});
  }

  document.onmousedown = (e)=>{
    let {clientX, clientY, pageX, pageY} = e;
    signal.trigger(ec.mouse.mousedown, {clientX, clientY, pageX, pageY});
  }

  document.onmouseout = (e)=>{
    let from = e.relatedTarget || e.toElement;
    if(!from || from.nodeName == "HTML"){
      controls.stopLookingWithMouse = true;
      lookClock = new Clock();//reset the time so cursor movement doesn't jump to somewhere other than where we left the screen.
    }
  }

  document.onmouseover = (e)=>{
    controls.stopLookingWithMouse = false;
  }
}

function listenKeyboard(){
  document.onkeydown = (e)=>{
    let keyCode = e.which;
    let keyPressed = String.fromCharCode(e.which);
    controls.keyPressed({keyPressed, keyCode});
  }
  document.onkeyup = (e)=>{
    let keyCode = e.which;
    let keyPressed = String.fromCharCode(e.which);
    controls.keyReleased({keyPressed, keyCode});
  }
}

function setupRequestFullScreen(){
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

function requestFullScreen(){
  var el = document.documentElement,
    rfs = el.requestFullscreen
      || el.webkitRequestFullScreen
      || el.mozRequestFullScreen
      || el.msRequestFullscreen
  ;

  rfs.call(el);
}