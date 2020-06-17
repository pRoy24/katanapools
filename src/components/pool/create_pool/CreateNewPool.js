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

export default class CreateNewPool extends Component {
  static contextType = StepperContext;
  constructor(props) {
    super(props);
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: '',
                  poolName: '', poolSymbol: '', showReceiptPage: false, isError: false, errorMessage: '',
                  tokenAddressList: [], currentStep: 'step2'};
    this.appStepper = React.createRef();
  }
  
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
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
    const {relayTokenAddress, convertibleTokenAddress} = this.state;
    const tokenList = vals.tokenAddressList;

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
    const {pool: {smartTokenContract, relayConverterStatus, poolFundedStatus, activationStatus}} = nextProps;

    if (isNonEmptyObject(relayConverterStatus) && relayConverterStatus.type === 'success' && this.props.pool.relayConverterStatus.type === 'pending') {
      this.setState({currentStep: 'step2'})
      this.appStepper.current.resolve();
    }

    if (isNonEmptyObject(activationStatus) && activationStatus.type === 'success' && this.props.pool.activationStatus.type === 'pending') {
    this.setState({showReceiptPage: true});
    }
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
    const STEP1 = "step-one";
    const STEP2 = "step-two";

    const {poolSymbol, isResolved, showReceiptPage, isError, errorMessage, tokenAddressList, currentStep} = this.state;

    const {pool: {smartTokenStatus, relayConverterStatus, poolFundedStatus, activationStatus, poolCreationHeader}} = this.props;

    let transactionStatusMessage = <span/>;

    if (isError) {
      transactionStatusMessage = (
            <Alert  variant={"danger"}>
              {errorMessage}
            </Alert>)
    } else {

    if (smartTokenStatus) {
        let message = <span/>;
        if (smartTokenStatus.message) {
          message = smartTokenStatus.message;
        }


        if (smartTokenStatus.type === 'pending') {
          if (smartTokenStatus.transactionHash) {
            message = <div className="broadcast-container">Deploying pool contract <AddressDisplay address={smartTokenStatus.transactionHash}/></div>;
          }
          transactionStatusMessage = (
              <Alert  variant={"info"}>
                <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
                {message}
              </Alert>
            )
        } else if (smartTokenStatus.type === 'error') {

          transactionStatusMessage = (
              <Alert  variant={"danger"}>
                {smartTokenStatus.message}
                Fix errors and click Resume to continue.
              </Alert>
            )
        }

      } else {
        transactionStatusMessage = <span/>;
      }

      if (isNonEmptyObject(relayConverterStatus)) {
        if (relayConverterStatus.type === 'pending') {
        transactionStatusMessage = (
            <Alert  variant={"info"}>
              <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
              {relayConverterStatus.message}
            </Alert>
          )
        } else if (relayConverterStatus.type === 'success') {
          transactionStatusMessage = <span/>;
        }
      }

      if (isNonEmptyObject(poolFundedStatus)) {
      if (poolFundedStatus.type === 'pending') {
        transactionStatusMessage = (
            <Alert  variant={"info"}>
              <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
              {poolFundedStatus.message}
            </Alert>
          )
      } else {
        transactionStatusMessage = <span/>;
      }
      }

      if (isNonEmptyObject(activationStatus)) {
      if (activationStatus.type === 'pending') {
        transactionStatusMessage = (
            <Alert  variant={"info"}>
              <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
              {activationStatus.message}
            </Alert>
          )
      } else {
        transactionStatusMessage = <span/>;
      }
      }
    }
    let currentPage = <span/>;

    if (showReceiptPage === false) {
      currentPage = (
        <Stepper contextRef={this.appStepper} initialStep={STEP1}>
          <Step stepId={STEP1} data="Step 1 initial state" title="Pool and Converter details" description="Configure convertible token">
              <Step1Container deployContract={this.deployConverterContract} getTokenDetail={this.getTokenDetail}
              setTokenListRow={this.props.setTokenListRow} setFormError={this.setFormError} resetFormError={this.resetFormError}
              resumePoolCreation={this.resumePoolCreation}/>
          </Step>
          <Step stepId={STEP2} title="Transfer ownership and activate" description="Transfer pool ownership" data={tokenAddressList} tokenAddressList={tokenAddressList}>
            <Step2Container fundRelayWithSupply={this.fundRelayWithSupply} getAddressList={this.getAddressList} acceptPoolOwnership={this.acceptPoolOwnership}/>
          </Step>
        </Stepper>
        )
    } else {
      transactionStatusMessage = <span/>;
      currentPage = <PoolReceipt pool={this.props.pool} fetchPoolAndConverterDetails={this.props.fetchPoolAndConverterDetails}
      fetchPoolDetails={this.props.fetchPoolDetails} setConversionFee={this.props.setConversionFee} approveAndFundPool={this.props.approveAndFundPool}/>
    }

    return (
      <div>
        <CreateNewPoolToolbar poolCreationHeader={poolCreationHeader}/>
        <div className="create-pool-wizard-container">
           {transactionStatusMessage}
           {currentPage}
        </div>
      </div>
      )
  }
}

