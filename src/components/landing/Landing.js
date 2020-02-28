import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Container, Row, Col, Button} from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import SwapTokens from '../swap/SwapTokens';

import PoolTokens from '../pool/PoolTokens';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Web3 from 'web3';



export default class Landing extends Component {
  constructor() {
    super();
    this.state = {currentView: 'pending'};
  }
  componentWillMount() {
    
    let web3 = window.web3;
    const self = this;
    window.addEventListener('load', async() => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          
          await window.ethereum.enable();
          self.props.setUserEnvironment();
          this.setState({currentView: 'home'});
          
        }
        catch (error) {
          console.log(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
      }

      // Non-dapp browsers...
      else {
        console.log("Error");
      }
    });

  }
  
  
  render() {

    let appHome = <span/>;
    if (this.state.currentView === 'home') {
      appHome = <AppHome {...this.props}/>
    }
    return (
      <Container>
        <div>
          {appHome}
        </div>
      </Container>
      )
  }
} 



class AppHome extends Component {
  constructor(props, context) {
    super(props);
    this.state = {'ConverterRegistryContractAddress': '', tokenData: [], toAmount: 0};
    this.web3 = window.web3;
  }
  

  render() {
    const {tokenData, toAmount} = this.state;
    let tokenDataSwap = <div>Loading</div>

    return (
      <div>
          <Switch>
          <Route path="/swap">
            <SwapTokens/>
          </Route>
          <Route path="/pool">
            <PoolTokens />
          </Route>
        </Switch>  
        
        </div>
  
      )
  }
}

AppHome.contextTypes = {
  drizzle: PropTypes.object
}