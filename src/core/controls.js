import {eventConfig as ec} from "core/eventConfig";
import {signal} from "core/core";

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

//start listening for keyboard, window, mouse movements, etc.
export function listen(){
  listenKeyboard();
  listenMouse();
  listenWindow();
}

//control camera position
let controls = {
  //how often to trigger camera movement
  triggersPerSecond: 120,
  //how far to move the camera in a given direction
  moveAmount: .025,
  //storage for keys that are currently pressed, and their associated interval id.
  //key should only be given one interval (started when key is first pressed, stopped when key is released)
  keysCurrentlyPressed: {key:undefined, intervalId:undefined},

  mouseMoved({x, y}){

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
    let amount = this.moveAmount;

    switch (keyPressed.toLowerCase()){
      case 'w':
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveForward, {amount});}); break;
      case 's':
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveBackward, {amount});}); break;
      case 'a':
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveLeft, {amount});}); break;
      case 'd':
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveRight, {amount});}); break;
      default:
        break;
    }

    switch(keyCode){
      case 38: //up
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveUp, {amount});}); break;
      case 40: //down
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveDown, {amount});}); break;
      case 39: //right
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveRight, {amount});}); break;
      case 37: //left
        this.startInterval(key, ()=>{signal.trigger(ec.camera.moveLeft, {amount});}); break;
      default:
        break;
    }
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
    let x = e.clientX;
    let y = e.clientY;
    //console.log(`mouse move x:${x} y:${y}`);
    controls.mouseMoved({x, y});
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