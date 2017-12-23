import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";
import Modal from 'reactComponents/Modal';
import Button from 'reactComponents/Button';
import TextWriterText from 'reactComponents/TypeWriterText';
import TypeWriterText from "./TypeWriterText";

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
    let fullTextToType=`
      In the year 1994, Tyson's Mom was exposed to radioactive slime while touring a Mcdonald's factory in South East Asia.
      <br/>
      She subsequently became an evil space cube and disappeared into the dark web.
      <br/>
      24 years later, people of Earth watched helplessly as she returned and destroyed the Moon.  Many are calling it the End of Days.
      <br/>
      Armed only with laser weapons, bravery, and the hope of planet Earth, you must defeat her and save the world from utter destruction.
      <br/>
      Pro Tip: Try luring her into the moon debris, where explosions from asteroids inflict severe damage.
    `;
    return (
      <Modal>
        <TypeWriterText fullTextToType={fullTextToType} textClassName="game-menu-message"/>
        <Button className="start-game-button" label="Press Start" onClick={this.handleStartGameClick.bind(this)}/>
      </Modal>
    );
  }

  createShowGameResultsModal(){
    let {didPlayerWin, resultMessage} = this.state;
    let fullTextToType=`
      ${resultMessage}
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    `;
    return (
      <Modal>
        <TypeWriterText fullTextToType={fullTextToType} textClassName="game-menu-message"/>
        <Button className="start-game-button" label="Press Start" onClick={this.handleStartGameClick.bind(this)}/>
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