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
    let componentToDisplay = this.modalMap[modalIdToDisplay];

    return componentToDisplay;
  }

  createStartMenuModal(){
    return (
      <Modal>
        <div>Hello Modal</div>
        <Button label="start game" onClick={this.handleStartGameClick.bind(this)}/>
      </Modal>
    );
  }

  createShowGameResultsModal(){
    let {didPlayerWin, resultMessage} = this.state;
    return (
      <Modal>
        <div>{resultMessage}</div>
        <Button label="start game" onClick={this.handleStartGameClick.bind(this)}/>
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
      [modalIdForWelcomeScreen]: this.createStartMenuModal(),
      [modalIdForResultsScreen]: this.createShowGameResultsModal(),
    }
  }

}
//
// {/*<div className="game-menu-component">*/}
// {/*Game Menu*/}
// {/*</div>*/}