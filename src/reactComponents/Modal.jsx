
import React from 'react';
import 'styles/index.scss';
import {signal, eventConfig as ec} from "core/core";

export default class Modal extends React.Component {
  constructor(){
    super();
    this.state = {};
  }

  componentWillMount(){
    // signal.registerSignals(this);
  }
  componentWillUnmount(){
    // signal.unregisterSignals(this);
  }
  render () {
    return (
      <div className="modal-component">
        <div className="modal-content">
          <button className="close-button" onClick={this.handleCloseButtonClick}>x</button>
          {this.props.children}
        </div>
      </div>
    );
  }

  handleCloseButtonClick(e){

  }

}

