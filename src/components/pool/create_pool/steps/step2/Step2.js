import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Tooltip, OverlayTrigger} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default class Step2 extends Component {

  constructor() {
    super();
    this.state = {tokenAmount: '', connectorAmount: '', detailsVisible: false};
  }
  tokenAmountChanged = (evt) => {
    this.setState({tokenAmount: evt.target.value});
  }

  connectorAmountChanged = (evt) => {
    this.setState({connectorAmount: evt.target.value});
  }

  onSubmit = (evt) => {
    evt.preventDefault();
    const {tokenAddressList, numPoolTokens} = this.state;
    const {pool: {converterContract}} = this.props;

    const converterContractAddress = converterContract._address;

    this.props.fundRelayWithSupply({'tokenAddressList': tokenAddressList, initialSupply: numPoolTokens, converterAddress: converterContractAddress});
  }

  componentWillMount(){
    const { pool: {tokenList}} = this.props;
    const currentAddressList = tokenList;
    let initialNumPoolTokens = 0;
    currentAddressList.forEach(function(currentAddresssItem){
      initialNumPoolTokens += 1;
    })
    this.setState({tokenAddressList: currentAddressList, numPoolTokens: initialNumPoolTokens});

  }

  setTokenAmount = (val, idx) => {
    let tokenAddressList = this.state.tokenAddressList;
    tokenAddressList[idx].amount = val;
    this.setState({tokenAddressList, tokenAddressList});
  }

  numPoolTokensChanged = (evt) => {
    this.setState({numPoolTokens: evt.target.value});
  }
  
  setAllowanceForPool = () => {
      
  }
  
  toggleDetailsBox = () => {
    this.setState({detailsVisible: !this.state.detailsVisible});
  }
  
  
  transferPoolOwnership = () => {
    const {pool: {relayConverterStatus}} = this.props;
    const converterAddress = relayConverterStatus.message.events["1"].address;
    const args = {
      converterAddress: converterAddress
    };
    this.props.acceptPoolOwnership(args);

  }
  
  
  render() {
    const { numPoolTokens,} = this.state;
    const { pool: {activationStatus}} = this.props;

    const self = this;


    let isTransferPending = false;
    
    if (activationStatus && activationStatus.pending) {
      isTransferPending = true;
    }


    return (
      <div className="create-pool-form-container">
        <Container>
          <div className="step-2-label">
            Execute acceptOwnership on the new converter contract.
          </div>        
          <Button onClick={this.transferPoolOwnership} disabled={isTransferPending}>Transfer pool ownership</Button>
        </Container>
      </div>
      )
  }
}
