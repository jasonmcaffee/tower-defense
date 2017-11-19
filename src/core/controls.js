import {eventConfig as ec} from "core/eventConfig";
import {signal} from "core/core";

export function listen(){
  listenKeyboard();
  listenMouse();
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
  document.onkeypress = (e)=>{
    let keyCode = e.keyCode;
    let keyPressed = String.fromCharCode(e.keyCode);
    controls.keyPressed({keyPressed, keyCode});
  }
}

let controls = {
  mouseMoved({x, y}){

  },

  keyPressed({keyPressed, keyCode}){
    switch (keyPressed){
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
  }
};