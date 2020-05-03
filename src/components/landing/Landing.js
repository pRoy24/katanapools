
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Container, Row, Col, Button} from 'react-bootstrap';
import {isEmptyObject, isEmptyString} from '../../utils/ObjectUtils';
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

  render() {
    let appPrompt = <span/>;

    const web3 = window.web3;

    if (isEmptyObject(web3) || isEmptyObject(web3.currentProvider) || isEmptyString(web3.currentProvider.selectedAddress)) {
      appPrompt = <Web3Prompt/>;
    }
    return (
      <div>
          {appPrompt}
          <Switch>
          <Route path="/swap">
            <SwapTokensContainer  getAllConvertibleTokens={this.props.getAllConvertibleTokens} getAllSmartTokens={this.props.getAllSmartTokens}/>
          </Route>
          <Route path="/pool">
            <PoolTokensContainer getAllSmartTokens={this.props.getAllSmartTokens}/>
          </Route>
          <Route path="/explore">
            <ExploreTokensContainer getAllConvertibleTokens={this.props.getAllConvertibleTokens}  getAllSmartTokens={this.props.getAllSmartTokens}
            getAllConvertibleTokensV2={this.props.getAllConvertibleTokensV2}/>
          </Route>
          <Route exact path="/">
            <ExploreTokensContainer getAllConvertibleTokens={this.props.getAllConvertibleTokens}  getAllSmartTokens={this.props.getAllSmartTokens}/>
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
