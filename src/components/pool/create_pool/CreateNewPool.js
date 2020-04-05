import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperContext
} from "react-material-stepper";
import Step1Container from './steps/step1/Step1Container';
import Step2Container from './steps/step2/Step2Container';
import Step3Container from './steps/step3/Step3Container';
import {isEmptyObject, isNonEmptyObject, isEmptyString} from '../../../utils/ObjectUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faSpinner, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import 'react-material-stepper/dist/react-stepper.css';
import AddressDisplay from '../../common/AddressDisplay';
import CreateNewPoolToolbar from './CreateNewPoolToolbar';

export default class CreateNewPool extends Component {
  static contextType = StepperContext;
  constructor(props) {
    super(props);
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: '',
                  poolName: '', poolSymbol: '', showReceiptPage: false, isError: false, errorMessage: '',
                  tokenAddressList: [], currentStep: 'step1'};
    this.appStepper = React.createRef();
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }

  resumePoolCreation = () => {
    const {pool: {poolStatus}} = this.props;
    console.log(poolStatus);
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
    }
     this.props.deployRelayConverter(args);
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
    const {pool: {smartTokenStatus, smartTokenContract, converterContractReceipt}} = this.props;
    const {relayTokenAddress, convertibleTokenAddress} = this.state;

    const args = {
      smartTokenAddress: smartTokenContract._address,
      converterAddress: converterContractReceipt.contractAddress
    }

    console.log(args);

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
    });

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

    if (isNonEmptyObject(poolFundedStatus) && poolFundedStatus.type === 'success' && this.props.pool.poolFundedStatus.type === 'pending') {
      this.setState({currentStep: 'step3'})
      this.appStepper.current.resolve();
    }

    if (isNonEmptyObject(this.props.pool.activationStatus) && activationStatus.type === 'success' &&
    this.props.pool.activationStatus.type === 'pending') {
      this.props.getSmartTokensWithSymbols();
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

  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";


    const {poolSymbol, isResolved, showReceiptPage, isError, errorMessage, tokenAddressList, currentStep} = this.state;

    const {pool: {smartTokenStatus, relayConverterStatus, poolFundedStatus, isCreationStepPending}} = this.props;

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
    }
    let currentPage = <span/>;
    if (showReceiptPage === false) {
      currentPage = (
        <Stepper contextRef={this.appStepper} currentStep={currentStep}>
          <Step stepId={STEP1} data="Step 1 initial state" title="Pool and Converter details" description="Configure convertible token">
              <Step1Container deployContract={this.deployConverterContract} getTokenDetail={this.getTokenDetail}
              setTokenListRow={this.props.setTokenListRow} setFormError={this.setFormError} resetFormError={this.resetFormError}
              resumePoolCreation={this.resumePoolCreation}/>
          </Step>
          <Step stepId={STEP2} title="Funding and initial supply" description="Fund pool with initial supply"
          data={tokenAddressList} tokenAddressList={tokenAddressList}>
            <Step2Container fundRelayWithSupply={this.fundRelayWithSupply} getAddressList={this.getAddressList}/>
          </Step>
          <Step stepId={STEP3} title="Pool Activation" description="Activate your pool">
            <Step3Container activatePool={this.activatePool} />
          </Step>
        </Stepper>
        )
    } else {
      transactionStatusMessage = <span/>;
      currentPage = <TransactioReceiptPage pool={this.props.pool}
      getConverterAndPoolDetails={this.props.getConverterAndPoolDetails}/>
    }

    return (
      <div>
        <CreateNewPoolToolbar/>
        <div className="create-pool-wizard-container">
           {transactionStatusMessage}
           {currentPage}
        </div>
      </div>
      )
  }
}

class TransactioReceiptPage extends Component {
  componentWillMount() {
    const {pool: {smartTokenStatus, converterContractReceipt}} = this.props;
    const args = {
      poolTokenAddress: smartTokenStatus.contractAddress,
      converterAddress: converterContractReceipt.contractAddress,
    }
    this.props.getConverterAndPoolDetails(args);
  }
  render() {
    const {pool: {poolCreationReceipt, tokenList}} = this.props;
    let receiptObject = <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>;

    let poolConvertibleTokens = tokenList.map(function(item, idx){
      return (<ListGroupItem>
        <div>Symbol: {item.symbol} Address: {item.address}</div>
        <div>Amount: {item.amount}</div>
      </ListGroupItem>)
    })
    if (isNonEmptyObject(poolCreationReceipt)) {
      receiptObject = (
        <div className="create-pool-form-container">
        <Container>
          <div className="h6">Pool Details.</div>
          <div className="pool-details-block">
            <Row>
            <Col lg={3} xs={6}>
            <div className="cell-label">
              Name:
            </div>
            <div className="cell-value">
              {poolCreationReceipt.poolName}
            </div>
            </Col>
            <Col lg={3} xs={6}>
            <div className="cell-label">Symbol: </div>
            <div className="cell-value">
              {poolCreationReceipt.poolSymbol}
            </div>
            </Col>
            <Col lg={3} xs={6}>
            <div className="cell-label">Address: </div>
            <div className="cell-value">
              {poolCreationReceipt.poolAddress}
            </div>
            </Col>
            <Col lg={3} xs={6}>
            <div className="cell-label">Supply: </div>
            <div className="cell-value">
            {poolCreationReceipt.poolSupply}
            </div>
            </Col>
            </Row>
          </div>
          <ListGroup>
          {poolConvertibleTokens}
          </ListGroup>
          <div>Provide your pool address to <a href="https://web.telegram.org/#/im?p=@BancorDevelopers" target="_blank">Bancor developers channel</a> for verification.</div>
        </Container>
        </div>
        )
    }
    return (
      <div className="receipt-page-container">
        {receiptObject}
      </div>

      )
  }
}


