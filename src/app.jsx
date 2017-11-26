import React from 'react';
import 'styles/index.scss';
import StageOne from 'stages/StageOne';
import {signal} from "core/core";
import {eventConfig as ec} from 'core/eventConfig';
import {stageOneConfig} from "stages/stageOneConfig";
import PlayerControls from 'reactComponents/PlayerControls';
import TopBar from 'reactComponents/TopBar';
import GameMenu from 'reactComponents/GameMenu';
import Game from 'Game';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <TopBar/>
        {/*<div id="follower">*/}
          {/*<div id="circle1"></div>*/}
          {/*<div id="circle2"></div>*/}
        {/*</div>*/}
        <div id="threeJsRenderDiv" className="threeJsRenderDiv">
        </div>
        <PlayerControls/>
        <GameMenu/>
      </div>

    )
  }

  componentDidMount(){
    console.log('mounted main app.jsx');
    // this.initCursor();
    this.requestFullScreen();

    let threeJsRenderDiv = document.getElementById("threeJsRenderDiv");
    // this.stage = new StageOne({stageConfig:stageOneConfig});
    // threeJsRenderDiv.appendChild( this.stage.rendererDomElement);
    this.game = new Game({threeJsRenderDiv});
  }

  componentWillUnmount(){
    signal.unregisterSignals(this);
    this.game.destroy();
  }

  //todo: pointer lock https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
  initCursor({movementsPerSecond=120}={}){
    let cursorElement = document.getElementById('follower');
    let x, y;
    let intervalMs = 1000/movementsPerSecond;
    window.onmousemove = (e)=>{
      x = e.clientX;
      y = e.clientY;

    }
    setInterval(function(){
      cursorElement.style.top = y + 'px';
      cursorElement.style.left = x + 'px';
    }, intervalMs)
  }

  requestFullScreen(){
    function handleInitialFullScreenRequestBegin(){
      var el = document.documentElement,
        rfs = el.requestFullscreen
          || el.webkitRequestFullScreen
          || el.mozRequestFullScreen
          || el.msRequestFullscreen
      ;

      rfs.call(el);
      document.body.removeEventListener('mousedown', handleInitialFullScreenRequestBegin);
    }
    //document.body.addEventListener('mousedown', handleInitialFullScreenRequestBegin, false);
  }

  getScreenDimensions(){
    let {innerWidth: width, innerHeight: height} = window;
    return {width, height};
  }
}


