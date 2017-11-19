import {eventConfig as eventConf} from 'core/eventConfig';
import Signal from 'core/Signal';
import {listen} from "core/keyboardListener";

//events
export let signal = new Signal();
export let eventConfig = eventConf;

listen();
