import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Container, Row, Col, Button} from 'react-bootstrap';
import HelpComponent from '../help/HelpComponent';
import SwapTokensContainer from '../swap/SwapTokensContainer';
import ExploreTokensContainer from '../explore/ExploreTokensContainer';
import PoolTokensContainer from '../pool/PoolTokensContainer';
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
    const self = this;
    const infura_provider = process.env.REACT_APP_INFURA_PROVIDER;

    if (window.ethereum && window.ethereum.selectedAddress) {
      const web3 = new Web3(window.ethereum);
      window.web3 = web3;
    } else {
      const web3 = new Web3(new Web3.providers.HttpProvider(`${infura_provider}`))
      window.web3 = web3;
    }

    window.addEventListener('load', async() => {
      if (window.ethereum) {

        try {
          await window.ethereum.enable();
          window.web3 = new Web3(window.ethereum);
          self.props.setMetaskConnected();
        }
        catch (error) {
         //  this.setState({currentView: 'prompt'});
        }
      window.ethereum.on('accountsChanged', function (accounts) {

        async function reload() {
          try {
            await window.ethereum.enable();
               window.web3 = new Web3(window.ethereum);
               self.props.setMetaskConnected();
          }
          catch (error) {

          }
        }
        reload();
    })
      }

    });

  }

  render() {

    return (
      <Container>
        <div>
         <AppHome {...this.props}/>
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

  componentWillReceiveProps(nextProps) {
    console.log('got new props');
  }

  render() {
    const {user: {providerConnected}} = this.props;
    let connectionPromptMessage = <span/>;
    if (!providerConnected) {
      connectionPromptMessage = (
      <div className="install-prompt">
        Please install <a href="https://metamask.io/" target="_blank">Metamask</a> and allow Katana to connect to proceed.
      </div>
        )
    }
    return (
      <div>
        {connectionPromptMessage}
          <Switch>
          <Route path="/swap">
            <SwapTokensContainer  getAllConvertibleTokens={this.props.getAllConvertibleTokens}
        getAllSmartTokens={this.props.getAllSmartTokens}/>
          </Route>
          <Route path="/pool">
            <PoolTokensContainer getSmartTokensWithSymbols={this.props.getSmartTokensWithSymbols}/>
          </Route>
          <Route path="/explore">
            <ExploreTokensContainer getAllConvertibleTokens={this.props.getAllConvertibleTokens}/>
          </Route>
          <Route path="/help">
            <HelpComponent/>
          </Route>
          <Route exact path="/">
            <SwapTokensContainer getAllConvertibleTokens={this.props.getAllConvertibleTokens}
        getAllSmartTokens={this.props.getAllSmartTokens}/>
          </Route>
        </Switch>
    </div>
      )
  }
}


