import {eventConfig as ec} from "core/eventConfig";
import {signal} from "core/core";

export function listen(){
  document.onkeypress = (e)=>{
    let keyPressed = String.fromCharCode(e.keyCode);
    console.log(`keypress: ${keyPressed}`);
    switch (keyPressed){
      case 'w':
        signal.trigger(ec.camera.zoomIn);
        break;
      case 's':
        signal.trigger(ec.camera.zoomOut);
        break;
      default:
        break;
    }

  }
}