
//FAILED - chrome does not support creating workers inside of workers. https://bugs.chromium.org/p/chromium/issues/detail?id=31666
//this will be stringified. no external references allowed
export default function orchestratorWorkerFunc(){
  //for creating subworkers
  export function NewWorker(workerFunctionString, onmessage){
    let blobURL = URL.createObjectURL(new Blob(['(',
      workerFunctionString,
      ')()'], {
      type: 'application/javascript'
    }));
    let worker = new Worker(blobURL);
    return worker;
  }

  function generateRandomNumber({min=1, max=100}={}){
    return Math.round(Math.random() * (max - min)) + min;
  }

  let workers = [];
  function initialize({numberOfWorkers, workerFunctionString}){
    for(let i = 0; i < numberOfSubWorkers; ++i){
      let newWorker = NewWorker(workerFunctionString, receiveMessageFromWorker);
      workers.push(newWorker);
    }
  }
  function destroy(){
    for(let i = 0, len = workers.length; i < len; ++i){
      let worker = workers[i];
      worker.onmessage = undefined;
    }
    postMessageToWorkers({command:'destroy'});
    workers = [];
  }

  function postMessageToRandomWorker(subWorkerData){
    let min = 0;
    let max = workers.length;
    let randomIndex = generateRandomNumber({min, max});
    let worker = workers[randomIndex];
    worker.postMessage(subWorkerData);
  }

  function postMessageToWorkers(subWorkerData){
    for(let i = 0, len = workers.length; i < len; ++i){
      let worker = workers[i];
      worker.postMessage(subWorkerData);
    }
  }

  function receiveMessageFromWorker(e){
    let data = e.data;
    postMessage(data);
  }

  onmessage = function(e){
    let data = e.data;
    let command = data.command;
    let subWorkerData = data.data;
    switch(command){
      case 'postMessageToWorkers':{ //e.g. update positions
        postMessageToWorkers(subWorkerData);
        break;
      }
      case 'postMessageToRandomWorker':{
        postMessageToRandomWorker(subWorkerData);
        break;
      }
      case 'intialize':{
        initialize(data);
        break;
      }
      case 'destroy':{
        destroy(data);
        break;
      }
      default:{
        console.log(`web worker orchestrator did not recognize command ${command}`);
      }
    }
  }
}