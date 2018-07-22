
export default class Signal{
  constructor(){
    this._signals= {};
  }

  //
  //@param context {object} - optional. the 'this' of the callback will be the context if passed.
  on(id, callback, context) {
    if (!this._signals[id]) {
      this._signals[id] = [];
    }

    var callbackWithContext = {
      context: context,
      callback: callback
    };
    this._signals[id].push(callbackWithContext);
  }

  off(id, context) {
    var signalCallbacksWithContext = this._signals[id];

    for(var i = 0; i < signalCallbacksWithContext.length; ++i){
      var callbackWithContext = signalCallbacksWithContext[i];
      if(callbackWithContext.context === context){
        signalCallbacksWithContext.splice(i, 1);
        console.log('removed signal id: ' + id + ' new count is : ' +signalCallbacksWithContext.length);
      }
    }

  }

  getSignalIds(){
    let result = [];
    for(let key in this._signals){
      result.push({key, length: this._signals[key].length});
    }
    return result;
  }

  trigger(id, data) {
    if (!this._signals[id]) {
      return;
    }

    if(id==="enemy.died"){
      console.log(`Signal enemy died callbacks: `, this._signals[id]);
    }

//https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
    const callbacksWithContext = this._signals[id];
    let i = callbacksWithContext.length;
    while(i--){
        // var callbackWithContext = this._signals[id][i];
        var callbackWithContext = callbacksWithContext[i];
        if(!callbackWithContext){
          console.warn(`Signal callbackWithContext is null for id: ${id} index: ${i}`, this._signals[id]);
          continue;
        }
        if (typeof callbackWithContext.callback === "function") {
          //callback(data);
          //context is optional
          if (callbackWithContext.context) {
            callbackWithContext.callback.call(callbackWithContext.context, data);
          } else {
            callbackWithContext.callback(data);
          }
        }
    }
  }

  registerSignals(objectWithSignals){
    if(!objectWithSignals || !objectWithSignals.signals){return;}
    for(var prop in objectWithSignals.signals){
      this.on(prop, objectWithSignals.signals[prop], objectWithSignals);
    }
  }

  unregisterSignals(objectWithSignals){
    if(!objectWithSignals || !objectWithSignals.signals){return;}
    for(var prop in objectWithSignals.signals){
      //console.log('signal off: ' + prop);
      this.off(prop, objectWithSignals);
    }
  }
}


