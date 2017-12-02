import {eventConfig as eventConf} from 'core/eventConfig';
import Signal from 'core/Signal';
import {listen} from "core/controls";

//events
export let signal = new Signal();
export let eventConfig = eventConf;
let ec = eventConfig;


listen();

export function generateUniqueId({name='component'}={}){
  return `${name}-${generateRandomNumber({max:1000000000})}-${Date.now()}`;
}

export function generateRandomNumber({min=1, max=100}={}){
  return Math.round(Math.random() * (max - min)) + min;
}

