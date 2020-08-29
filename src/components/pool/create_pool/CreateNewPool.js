import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperContext
} from "react-material-stepper";
import Step1Container from './steps/step1/Step1Container';
import Step2Container from './steps/step2/Step2Container';

import {isEmptyObject, isNonEmptyObject, isEmptyString} from '../../../utils/ObjectUtils';
import {getWalletAddress} from '../../../utils/eth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faSpinner, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import 'react-material-stepper/dist/react-stepper.css';
import AddressDisplay from '../../common/AddressDisplay';
import CreateNewPoolToolbar from './CreateNewPoolToolbar';
import PoolReceipt from './PoolReceipt';
import CreateV1Pool from './v1/CreateV1Pool';
import CreateV2Pool from './v2/CreateV2Pool';


export default class CreateNewPool extends Component {
  static contextType = StepperContext;
  constructor(props) {
    super(props);
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: '',
                  poolName: '', poolSymbol: '', showReceiptPage: false, isError: false, errorMessage: '',
                  tokenAddressList: [], currentStep: 'step2', poolView: 'v1'};
    this.appStepper = React.createRef();
  }

  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  
  setCurrentPoolView = (type) => {
    this.setState({'poolView': type});
  }

  getAddressList = () => {
    const {pool: {tokenList}} = this.props;
    return tokenList;
  }

  deployConverterContract = (vals) => {
    const web3 = window.web3;
    const {pool: {smartTokenStatus, smartTokenContract}} = this.props;

    let isValidationError = false;
    const self = this;

    const walletAddress = getWalletAddress();
    if (isEmptyString(walletAddress)) {
         isValidationError = true;
         self.setState({isError: true, errorMessage: `Please connect a web3 provider to make this transaction`});
    }

    this.setState({convertibleTokenAddress: vals.convertibleTokenAddress, relayTokenAddress: smartTokenStatus.contractAddress});
    const {tokenArrayList} = vals;
   let tokenAddressList = [];
   if (vals.poolType === 'relay') {
    const baseReserveAddress = this.getBaseReserveAddress(vals.baseReserveSelected);
    tokenAddressList.push({'address': baseReserveAddress, 'weight': parseFloat(vals.baseReserveWeight), 'type': 'relay'});
   }
   tokenArrayList.forEach(function(item, idx){
     if (!isEmptyString(item.address) && item.weight && item.weight > 0) {
       try {
         const itemAddress = web3.utils.toChecksumAddress(item.address);
         tokenAddressList.push({
           'address': itemAddress,
           'weight': parseFloat(item.weight),
           'type': 'convertible',
           'symbol': item.symbol
         })
       } catch(e) {
         isValidationError = true;
         self.setState({isError: true, errorMessage: `Address at row ${idx + 1} is not a valid ERC20 address`});
       }
     }
   })

   let totalWeight = 0;
   tokenAddressList.forEach(function(tokenItem){
     if (tokenItem.address) {
       totalWeight += tokenItem.weight;
     }
   });
   
   const poolReserves = tokenAddressList.map(function(item){
     return item.address;
   });
   
   const poolWeights = tokenAddressList.map(function(item){
     return parseInt(item.weight, 10) * 10000;
   })

   if (totalWeight > 100) {
     this.setState({isError: true, errorMessage: 'Total weight cannot be more than 100'});
   } else if (!isValidationError) {
    this.setState({isError: false, errorMessage: '', tokenAddressList: tokenAddressList});
    const args = {
      poolName: vals.poolName,
      poolSymbol: vals.poolSymbol,
      poolDecimals: vals.poolDecimals,
      reserveFee: parseFloat(vals.reserveFee),
      smartTokenAddress: smartTokenStatus.contractAddress,
      tokenAddressList: tokenAddressList,
      reserves: poolReserves,
      weights: poolWeights
    }
     this.props.deployNewPool(args);
   }
  }

  getBaseReserveAddress = (baseReserveSelected) => {
    const web3 = window.web3;
    const currentProvider = web3.currentProvider.networkVersion;
    if (currentProvider === '1') {
      if (baseReserveSelected === 'BNT') {
        return process.env.REACT_APP_BNT_ID_MAINNET;
      } else {
        return process.env.REACT_APP_USDB_ID_MAINNET;
      }
    } else {
      if (baseReserveSelected === 'BNT') {
        return process.env.REACT_APP_BNT_ID_ROPSTEN;
      } else {
        return process.env.REACT_APP_USDB_ID_ROPSTEN;
      }
    }
  }

  activatePool = () => {
    const {pool: { smartTokenContract, converterContract}} = this.props;


    const args = {
      smartTokenAddress: smartTokenContract._address,
      converterAddress: converterContract._address
    }

    this.props.activatePool(args);
  }

  fundRelayWithSupply = (vals) => {
    const self = this;
    const {pool, pool: {relayContractReceipt, converterContractReceipt, smartTokenContract}} = this.props;
    const {relayTokenAddress, convertibleTokenAddress, poolView} = this.state;
    const tokenList = vals.tokenAddressList;

    if (poolView === 'v2') {
      return <div>Bancor V2 pools are coming soon</div>
    }
    let isValidationError = false;
    tokenList.forEach(function(tokenItem, idx){
      if (parseFloat(tokenItem.amount) > parseFloat(tokenItem.senderBalance)) {
        self.setState({isError: true, errorMessage: `Amount entered for ${tokenItem.symbol}
        is greater than wallet balance for ${tokenItem.symbol}`});
        isValidationError = true;
      }
      if (parseFloat(tokenItem.amount) <= 0) {
        self.setState({isError: true, errorMessage: `Amount entered for ${tokenItem.symbol} must be greater than 0`});
        isValidationError = true;
      }
    });

    if (parseFloat(vals.initialSupply) <= 0) {
        self.setState({isError: true, errorMessage: `Pool supply must be greater than 0`});
        isValidationError = true;
    }

    const args = {
      convertibleTokens: vals.tokenAddressList,
      initialSupply: vals.initialSupply,
      smartTokenAddress: smartTokenContract._address,
      converterAddress: vals.converterAddress
    }



    if (!isValidationError) {
        this.setState({isError: false, errorMessage: ''});
      this.props.fundRelayWithSupply(args);
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  setFormError = (errorMessage)  => {
    this.setState({isError: true, errorMessage: errorMessage});
  }

  resetFormError = () => {
    this.setState({isError: false, errorMessage: ''});
  }

  componentWillUnmount() {
    this.props.resetPoolStatus();
  }
  
  acceptPoolOwnership = (args) => {
    this.props.acceptPoolOwnership(args);
  }

  render() {

    


    const {poolSymbol, isResolved, showReceiptPage, isError, errorMessage, tokenAddressList, currentStep} = this.state;

    const {pool: {smartTokenStatus, relayConverterStatus, poolFundedStatus, activationStatus, poolCreationHeader, currentPoolType}} = this.props;
    let currentPage = <span/>;
    let transactionStatusMessage = <span/>;

    
    if (currentPoolType === 'v2') {
      currentPage = <CreateV2Pool {...this.props}/>
    } else if (currentPoolType === 'v1') {
      currentPage = <CreateV1Pool {...this.props}/>
    } else {
      currentPage = <div>Invalid pool type</div>
    }

    return (
      <div>
        <CreateNewPoolToolbar poolCreationHeader={poolCreationHeader} setCurrentPoolView={this.setCurrentPoolView}
          setCurrentPoolView={this.props.setCurrentPoolView}/>
        <div className="create-pool-wizard-container">
           {transactionStatusMessage}
           {currentPage}
        </div>
      </div>
      )
  }
}

