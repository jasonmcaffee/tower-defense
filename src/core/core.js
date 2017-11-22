import {eventConfig as eventConf} from 'core/eventConfig';
import Signal from 'core/Signal';
import {listen} from "core/controls";
import {NewWorker} from "core/WebWorker";
//events
export let signal = new Signal();
export let eventConfig = eventConf;
export let worker = NewWorker(()=>{
  postMessage('hello from the worker');
});

listen();

export function generateUniqueId({name='component'}={}){
  let min = 1;
  let max = 1000000000;
  let randomId = Math.round(Math.random() * (max - min)) + min;
  let id =  `${name}-${randomId}-${Date.now()}`;  //'t: ' + type + ' d: ' + Date.now() + 'randomId: ' +randomId;
  return id;
}
