import {eventConfig as ec} from "core/eventConfig";
import {signal} from "core/core";
import {Clock, Math as threeMath} from "three";

let clock = new Clock();

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
  controls.startMouseInterval();
}

//control camera position
let controls = {
  //how often to trigger camera movement
  triggersPerSecond: 120,
  mouseTriggersPerSecond: 120,
  //how far to move the camera in a given direction
  moveAmount: .025,
  //storage for keys that are currently pressed, and their associated interval id.
  //key should only be given one interval (started when key is first pressed, stopped when key is released)
  keysCurrentlyPressed: {key:undefined, intervalId:undefined},

  mouseMoved({pageX, pageY, height=window.innerHeight, width=window.innerWidth}){
    this.x = pageX - (width/2);
    this.y = pageY - (height/2);
  },

  //debounce calcs done for camera position based on mouse event.
  startMouseInterval({intervalMs=1000/this.mouseTriggersPerSecond, lookSpeed=0.1,}={}){
    if(this.startedMouse){return;}
    this.startedMouse = true;

    setInterval(function interval(){
      let {x,y}=this;
      let delta = clock.getDelta();
      //console.log('delta is ', delta);
      //look
      var actualLookSpeed = delta * lookSpeed;
      var verticalLookRatio = 1;
      if(isNaN(this.lon)){
        console.log('lon is null')
        this.lon = 0;
      }
      if(isNaN(this.lat)){
        console.log('lat is null')
        this.lat = 0;
      }
      this.lon += x * actualLookSpeed;
      //if( this.lookVertical )
      this.lat -= y * actualLookSpeed * verticalLookRatio;

      this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
      this.phi = threeMath.degToRad( 90 - this.lat );

      this.theta = threeMath.degToRad( this.lon );

      this.xyz = {
        x: 100 * Math.sin( this.phi ) * Math.cos(this.theta),
        y: 100 * Math.cos( this.phi ),
        z: 100 * Math.sin( this.phi ) * Math.sin( this.theta )
      };
      if(isNaN(this.xyz.x)){
        console.log('x is NAN');
        return;
      }
      signal.trigger(ec.camera.setLookAtFromMouseMovement, this.xyz);
    }.bind(this), intervalMs);
  },

  startInterval(key, f, triggersPerSecond=this.triggersPerSecond){
    if(this.keysCurrentlyPressed[key]){
      return;
    }
    let intervalMs = 1000 / triggersPerSecond;
    let intervalId = setInterval(f, intervalMs);
    this.keysCurrentlyPressed[key] = intervalId;
  },

  stopInterval(key){
    let intervalId = this.keysCurrentlyPressed[key];
    this.keysCurrentlyPressed[key] = undefined;
    clearInterval(intervalId);
  },

  //stop controlling camera position
  keyReleased({keyReleased, keyCode}){
    let key = keyCode + '';
    this.stopInterval(key);
  },

  //control the camera position
  keyPressed({keyPressed, keyCode}){
    let key = keyCode + '';
    console.log('keycode: ' + key);
    let amount = this.moveAmount;
    let event;

    switch (keyPressed.toLowerCase()){
      case 'w':
        event = moveForward; break;
      case 's':
        event = moveBackward; break;
      case 'a':
        event = moveLeft; break;
      case 'd':
        event = moveRight; break;
      default:
        break;
    }

    switch(keyCode){
      case 32: //up via spacebar
        event = moveUp;  break;
      case 38: //up
        event = moveUp; break;
      case 16: //down via left shift
        event = moveDown; break;
      case 40: //down
        event = moveDown; break;
      case 39: //right
        event = moveRight; break;
      case 37: //left
        event = moveLeft;  break;
      default:
        break;
    }
    if(!event){return;}
    this.startInterval(key, ()=>{signal.trigger(event, {amount});});
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
    let {clientX, clientY, pageX, pageY} = e;
    //console.log(`mouse move x:${x} y:${y}`);
    controls.mouseMoved({clientX, clientY, pageX, pageY});
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