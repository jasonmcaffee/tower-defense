import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";
import Modal from 'reactComponents/Modal';
import Button from 'reactComponents/Button';

const modalIdForWelcomeScreen = "modal1";
const modalIdForResultsScreen = "modal2";

export default class GameMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      modalIdToDisplay: modalIdForWelcomeScreen,
      resultMessage:'',
      didPlayerWin: false,
    };
  }

  componentWillMount(){
    signal.registerSignals(this);
    this.createModalMap();
  }
  componentWillUnmount(){
    signal.unregisterSignals(this);
  }

  signals = {
    [ec.game.gameEnded]({resultMessage, didPlayerWin}){
      let modalIdToDisplay = modalIdForResultsScreen;
      this.setState({resultMessage, didPlayerWin, modalIdToDisplay});
    }
  }
  render(){
    let modalComponent = this.createStartMenuModal();
    let {modalIdToDisplay} = this.state;
    let componentToDisplayFunc = this.modalMap[modalIdToDisplay];
    let componentToDisplay = componentToDisplayFunc ? componentToDisplayFunc(): null;
    let result = null;
    if(componentToDisplay){
      result = (
        <div className="game-menu-component">
          {componentToDisplay}
        </div>
      );
    }

    return result;
  }

  createStartMenuModal(){
    return (
      <Modal>
        <div className="game-menu-message">You must save the galaxy from a dystopian future terrorized by Tyson's mom.</div>
        <br/>
        <div className="game-menu-message">Defeat her in this 3 dimensional world by shooting lasers and using mines to your advantage.</div>
        <br/>
        <div className="game-menu-message">The fate of the galaxy lies in your hands.  Good luck!</div>
        <br/>
        <div className="game-menu-message">Pro Tip: you can move faster by moving in 3 directions at once (e.g. press left-shift + w + d at the same time)</div>
        <br/>
        <br/>
        <br/>
        <Button className="start-game-button" label="start" onClick={this.handleStartGameClick.bind(this)}/>
      </Modal>
    );
  }

  createShowGameResultsModal(){
    let {didPlayerWin, resultMessage} = this.state;
    return (
      <Modal>
        <div className="game-menu-message">{resultMessage}</div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <Button className="start-game-button" label="start" onClick={this.handleStartGameClick.bind(this)}/>
      </Modal>
    );
  }

  handleStartGameClick(){
    console.log('start game');
    signal.trigger(ec.game.startGame);
    this.setState({modalIdToDisplay:'none'})
  }

  createModalMap(){
    this.modalMap = {
      'none': null,
      [modalIdForWelcomeScreen]: this.createStartMenuModal.bind(this),
      [modalIdForResultsScreen]: this.createShowGameResultsModal.bind(this),
    }
  }

}
//
// {/*<div className="game-menu-component">*/}
// {/*Game Menu*/}
// {/*</div>*/}