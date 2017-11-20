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
