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

export function listen(){
  listenKeyboard();
  listenMouse();
  listenWindow();
}

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
    //console.log(`keyCode: ${keyCode} keyPressed: ${keyPressed}`);
    controls.keyPressed({keyPressed, keyCode});
  }
}

let controls = {
  mouseMoved({x, y}){

  },

  keyPressed({keyPressed, keyCode}){
    switch (keyPressed.toLowerCase()){
      case 'w':
        signal.trigger(ec.camera.moveForward); break;
      case 's':
        signal.trigger(ec.camera.moveBackward); break;
      case 'a':
        signal.trigger(ec.camera.moveLeft); break;
      case 'd':
        signal.trigger(ec.camera.moveRight); break;
      default:
        break;
    }

    switch(keyCode){
      case 38: //up
        signal.trigger(ec.camera.moveUp); break;
      case 40: //down
        signal.trigger(ec.camera.moveDown); break;
      case 39: //right
        signal.trigger(ec.camera.moveRight); break;
      case 37: //left
        signal.trigger(ec.camera.moveLeft); break;
      default:
        break;
    }
  }
};