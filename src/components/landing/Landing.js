
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Container, Row, Col, Button} from 'react-bootstrap';

import SwapTokensContainer from '../swap/SwapTokensContainer';
import ExploreTokensContainer from '../explore/ExploreTokensContainer';
import PoolTokensContainer from '../pool/PoolTokensContainer';
import HelpComponent from '../help/HelpComponent';
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
        this.props.setMetaskConnected();
        try {
          await window.ethereum.enable();
          self.props.setUserEnvironment();
          this.setState({currentView: 'home'});
        }
        catch (error) {
           this.setState({currentView: 'prompt'});
        }
      window.ethereum.on('accountsChanged', function (accounts) {

        async function reload() {
          window.web3 = new Web3(window.ethereum);
          try {

            await window.ethereum.enable();
            self.props.setUserEnvironment();
            self.setState({currentView: ''}, function(){
              self.setState({currentView: 'home'});
            });
          }
          catch (error) {

          }
        }
        reload();
    })
      }
      else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
      }
      else {
           this.setState({currentView: 'prompt'});
      }
    });
  }

  render() {

    let appHome = <span/>;
    if (this.state.currentView === 'home') {
      appHome = <AppHome {...this.props}/>
    } else if (this.state.currentView === 'prompt'){
      appHome = <Web3Prompt/>
    }
    if (window.web3 && window.web3.currentProvider && window.web3.currentProvider.selectedAddress === null) {
      return  <div className="install-prompt">Please click connect on Metamask prompt to continue.</div>
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

  componentWillMount() {

      //  this.props.getConvertibleToSmartTokenMap();
  }


  render() {
    const web3 = window.web3;

    return (
      <div>
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
          <Route exact path="/">
            <SwapTokensContainer getAllConvertibleTokens={this.props.getAllConvertibleTokens}
        getAllSmartTokens={this.props.getAllSmartTokens}/>
          </Route>
          <Route path="/help">
            <HelpComponent/>
          </Route>

        </Switch>
    </div>
      )
  }
}


class Web3Prompt extends Component {
  render() {
    return (
      <div className="install-prompt">
        Please install <a href="https://metamask.io/" target="_blank">Metamask</a> and allow Katana to connect to proceed.
      </div>
      )
  }
}
