import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperAction,
  StepperContent,
  StepperContext
} from "react-material-stepper";
import {isEmptyObject, isNonEmptyObject} from '../../../utils/ObjectUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import 'react-material-stepper/dist/react-stepper.css';

import CreateNewPoolToolbar from './CreateNewPoolToolbar';

export default class CreateNewPool extends Component {
  static contextType = StepperContext;
  constructor(props) {
    super(props);
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: '',
                  poolName: '', poolSymbol: '', showReceiptPage: false, isError: false, errorMessage: '',
      tokenAddressList: [], currentStep: 'step1',
    };
    this.appStepper = React.createRef();
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  deployPoolContract = (vals) => {
    this.setState({poolName: vals.poolName, poolSymbol: vals.poolSymbol});
    this.props.deployPoolContract(vals);
  }
  
  getAddressList = () => {
    return this.state.tokenAddressList;
  }
  deployConverterContract = (vals) => {

    const {pool: {smartTokenStatus, smartTokenContract}} = this.props;
    this.setState({convertibleTokenAddress: vals.convertibleTokenAddress, relayTokenAddress: smartTokenStatus.contractAddress});

    const {tokenArrayList} = vals;
   
   let tokenAddressList = [];
   const baseReserveAddress = this.getBaseReserveAddress(vals.baseReserveSelected); 
   tokenAddressList.push({'address': baseReserveAddress, 'weight': parseFloat(vals.baseReserveWeight), 'type': 'relay'});
   tokenArrayList.forEach(function(item){
     if (item.address && item.weight) {
       tokenAddressList.push({
         'address': item.address,
         'weight': parseFloat(item.weight),
         'type': 'convertible'
       })
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
   } else {
    this.setState({isError: false, errorMessage: '', tokenAddressList: tokenAddressList});
    const args = {
      maxFee: parseFloat(vals.reserveFee).toFixed(2),
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
      smartTokenAddress: smartTokenStatus.contractAddress,
      converterAddress: converterContractReceipt.contractAddress
    }
    
    this.props.activatePool(args);
  }
  
  fundRelayWithSupply = (vals) => {
    const {pool, pool: {relayContractReceipt, converterContractReceipt}} = this.props;
    const {relayTokenAddress, convertibleTokenAddress} = this.state;

    const args = {
      convertibleTokenAddress: convertibleTokenAddress,
      convertibleTokenAmount: vals.tokenAmount,
      networkTokenAmount: vals.connectorAmount,
      smartTokenAddress: relayTokenAddress,
      converterAddress: converterContractReceipt.contractAddress
    }
    
    this.props.fundRelayWithSupply(args);
  }
  
  componentWillReceiveProps(nextProps) {
    const {pool: {smartTokenContract, relayConverterStatus, poolFundedStatus, activationStatus}} = nextProps;
    
    if (!isEmptyObject(smartTokenContract) && isEmptyObject(this.props.pool.smartTokenContract)) {
      this.setState({currentStep: 'step2'})
      this.appStepper.current.resolve();

    }

    if (isNonEmptyObject(relayConverterStatus) && relayConverterStatus.type === 'success' && this.props.pool.relayConverterStatus.type === 'pending') {
          this.setState({currentStep: 'step3'})
      this.appStepper.current.resolve();    
    }
    
    if (isNonEmptyObject(poolFundedStatus) && poolFundedStatus.type === 'success' && this.props.pool.poolFundedStatus.type === 'pending') {
          this.setState({currentStep: 'step4'})
      this.appStepper.current.resolve();          
    }

    if (isNonEmptyObject(this.props.pool.activationStatus) && activationStatus.type === 'success' &&
    this.props.pool.activationStatus.type === 'pending') {
      this.setState({showReceiptPage: true});
    }
  }
  
  getTokenDetail = (val, idx) => {

   this.props.getTokenDetailFromAddress(val, idx);
   
  }
  

  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";
    const STEP4 = "step-four";
    
    const {poolSymbol, isResolved, showReceiptPage, isError, errorMessage, tokenAddressList, currentStep} = this.state;

    const {pool: {isFetching, smartTokenStatus, relayConverterStatus, poolFundedStatus}, pool,} = this.props;

    let transactionStatusMessage = <span/>;
    
    if (isError) {
      transactionStatusMessage = (
            <Alert  variant={"danger"}>
              {errorMessage}
            </Alert>)
    } else {
    if (isFetching) {
        let message = <span/>;
        if (smartTokenStatus.message) {
          message = smartTokenStatus.message;
        }
        if (smartTokenStatus.transactionHash) {
          message = "Transaction broadcast " + smartTokenStatus.transactionHash;
        }
        transactionStatusMessage = (
            <Alert  variant={"info"}>
              <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
              {message}
            </Alert>
          )
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
        <Stepper contextRef={this.appStepper} currentStep={currentStep} initialStep={STEP2}>
          <Step
            stepId={STEP1}
            data="Step 1 initial state"
            title="Pool name"
            description="Pool name and symbol"
          >
            <Step1 handler={this.setStepOneReceipt} smartTokenStatus={pool.smartTokenStatus}
            isFetching={pool.isFetching} deployPoolContract={this.deployPoolContract} 
            isResolved={isResolved}/>
          </Step>
          <Step stepId={STEP2} title="Converter details" description="Configure convertible token">
              <Step2 tokenSymbol={poolSymbol} pool={pool} deployContract={this.deployConverterContract} getTokenDetail={this.getTokenDetail}
              setTokenListRow={this.props.setTokenListRow}/>
          </Step>
          <Step stepId={STEP3} title="Funding and initial supply" description="Fund pool with initial supply" 
          data={tokenAddressList} tokenAddressList={tokenAddressList}>
            <Step3 fundRelayWithSupply={this.fundRelayWithSupply} getAddressList={this.getAddressList}/>
          </Step>
          <Step stepId={STEP4} title="Pool Activation" description="Activate your pool">
            <Step4 activatePool={this.activatePool} />
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
        <div className="">
           {transactionStatusMessage}
           {currentPage}
        </div>
      </div>
      )
  }
}


class Step1 extends Component {
  constructor(props) {
    super(props);
    this.state = {poolName: '', poolSymbol: '', poolDecimals: 18, txMsg: {}}
  }

  onSubmit = (e) => {
    e.preventDefault();
    const self = this;
    this.props.deployPoolContract(this.state);
  }
  
  formNameChanged = (evt) => {
    this.setState({poolName: evt.target.value});
  }
  
  formSymbolChanged = (evt) => {
    this.setState({poolSymbol: evt.target.value});
  }
  
  formDecimalsChanged = (evt) => {
    this.setState({poolDecimals: 18});
  }
  render() {
    const {poolName, poolSymbol, poolDecimals} = this.state;
    const {smartTokenStatus, isFetching} = this.props;

    return (
      <div className="create-pool-form-container">

      <div className="create-form-container">
         <Container>
        <Form onSubmit={this.onSubmit}> 
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Pool Name</Form.Label>
          <Form.Control type="text" placeholder="name" onChange={this.formNameChanged} value={poolName}/>
          <Form.Text className="text-muted" >
            Enter the pool name eg. XXX Smart Relay Token 
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Pool Symbol</Form.Label>
          <Form.Control type="text" placeholder="symbol" value={poolSymbol} onChange={this.formSymbolChanged}/>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Pool Decimals</Form.Label>
          <Form.Control type="text" placeholder="decimals" value={poolDecimals} onChange={this.formDecimalsChanged}/>
        </Form.Group>
        <Row>
        <Col lg={2}>
        <Button variant="primary" type="submit">
          Next
        </Button>
        </Col>
        <Col lg={10}>
   
        </Col>
        </Row>
      </Form>
      </Container>
      </div>
      </div>)
  }
}

class Step2 extends Component {
  static contextType = StepperContext;
  
  constructor() {
    super();
    this.state = {convertibleTokenAddress: '', reserveFee: 3, tokenArrayList: [], baseReserveSelected: '', baseReserveWeight: ''};
  }
  
  componentWillMount() {
    this.setState({maxFee: 3, weight: 50, tokenArrayList: [{'address': '', weight: 50}],
    baseReserveSelected: 'BNT', baseReserveWeight: 50});
    this.props.setTokenListRow();
  }
  onSubmit = (e) => {
    e.preventDefault();

    this.props.deployContract(this.state);
    
  }

  
  reserveFeeChanged = (e) => {
    this.setState({reserveFee: e.target.value});
  }
  
  addReserveTokenRow = () => {
    let currentRowList = this.state.tokenArrayList;
    currentRowList.push({'weight': '', 'address': ''});
    this.setState({tokenArrayList: currentRowList});
    this.props.setTokenListRow();
  }
  
  weightChanged = (value, idx) => {
    let currentRowList = this.state.tokenArrayList;
    currentRowList[idx].weight = value;
    this.setState({tokenArrayList: currentRowList});    
  }
  
  addressChanged = (value, idx) => {
    let currentRowList = this.state.tokenArrayList;
    currentRowList[idx].address = value;
    this.setState({tokenArrayList: currentRowList});        
  }
  
  baseReserveChanged = (evt) => {
    this.setState({baseReserveSelected: evt.target.value});
  }
  
  baseWeightValueChanged = (evt) => {
    this.setState({baseReserveWeight: evt.target.value});
  }
  render() {

    const {baseReserveWeight, reserveFee, tokenArrayList} = this.state;
    const {getTokenDetail} = this.props;
    let weightPromptMessage = <span/>;
    
    const self = this;
    
    let tokenArrayListDisplay = tokenArrayList.map(function(item, idx){
      return <TokenFormRow key={`token-form-row-${idx}`} address={item.address} weight={item.weight} idx={idx}
      weightChanged={self.weightChanged} addressChanged={self.addressChanged} getTokenDetail={getTokenDetail}/>;
    })

    return (
        <div className="create-pool-form-container">
        <div className="create-form-container">
        <ButtonGroup aria-label="Basic example">
          <Button variant="primary">Require relay token</Button>
          <Button variant="secondary">Any ERC20 token</Button>
        </ButtonGroup>
        <Container>
        <Form onSubmit={this.onSubmit}> 
        <Row>
        <Col lg={8}>
        <Form.Group controlId="formBasicEmail">
         <Form.Label>Select base token</Form.Label>
          <Form.Control as="select" onChange={this.baseReserveChanged} selected={this.baseReserveSelected}>
            <option>BNT</option>
            <option>USDB</option>
          </Form.Control>
        </Form.Group>
        </Col>
        <Col lg={4}>
          <div className="slidecontainer">
            <Form.Label>{`Token reserve ratio - ${baseReserveWeight}`}</Form.Label>
            <input type="range" min="0" max="100" value={baseReserveWeight} className="slider"
            id="myRange" onChange={this.baseWeightValueChanged}/>
          </div>        
        </Col>
        </Row>
        {tokenArrayListDisplay}
        <Button onClick={this.addReserveTokenRow}>Add another reserve token <FontAwesomeIcon icon={faPlus} /></Button>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Conversion fees</Form.Label>
            <InputGroup>
            <Form.Control type="text" placeholder="reserve fee" value={reserveFee} onChange={this.reserveFeeChanged}/>
            <InputGroup.Append>
              <InputGroup.Text id="inputGroupPrepend">%</InputGroup.Text>
            </InputGroup.Append>

          </InputGroup>
                    <Form.Text className="text-muted">
            Enter the max conversion fees when using this reserve (Recommended 3%)
          </Form.Text>
        </Form.Group>
        
        <Row className="form-submit-container">
        <Col lg={6} xs={12}>

        </Col>
        <Col lg={6} xs={12}>
          <div>
            {weightPromptMessage}
          </div>
        </Col>
        </Row>
        <Button variant="primary" type="submit">
          Next
        </Button>
      </Form>
        </Container>
        </div>
      </div>
    )
  }
}

class Step3 extends Component {
  static contextType = StepperContext;  
  constructor() {
    super();
    this.state = {tokenAmount: '', connectorAmount: ''};
  }
  tokenAmountChanged = (evt) => {
    this.setState({tokenAmount: evt.target.value});
  }
  
  connectorAmountChanged = (evt) => {
    this.setState({connectorAmount: evt.target.value});
  }
  
  onSubmit = (evt) => {
    evt.preventDefault();
    console.log(this.state.tokenAddressList);
    
  //  this.props.fundRelayWithSupply(this.state);
  }
  
  componentWillMount(){
    const currentAddressList = this.props.getAddressList();
    this.setState({tokenAddressList: currentAddressList});
  }
  
  setTokenAmount(val, idx) {
    let tokenAddressList = this.state.tokenAddressList;
    tokenAddressList[idx].amount = val;
    this.setState({tokenAddressList, tokenAddressList});
  } 

  render() {
    const {tokenAmount, connectorAmount, tokenAddressList} = this.state;

    let tokenAmountDisplay = tokenAddressList.map(function(item, key){
       return <TokenAmountRow key={`amount-row-${key}`} item={item} idx={key}/>      
    });

    return (
        <div className="create-pool-form-container">
        <Container>
        <Form onSubmit={this.onSubmit}> 
        
        {tokenAmountDisplay}
        
        <Form.Text className="text-muted">
            Please ensure that the USD value of both reserve tokens are roughly equal.
        </Form.Text>
          <Button variant="primary" type="submit">
            Next
          </Button>
        </Form>
      </Container>
      </div>
      )
  }
}

class Step4 extends Component {
  render() {
    return (
      <Container>
        <Row>
          <Col lg={12}>
            <div className="h5 activation-heading">Your pool is now ready to be activated !!</div>
            <div>
            <div className="activation-text">In order to activate the liquidity pool - </div> 
            <div className="activation-text">You need to transfer pool ownership to the converter</div>
            <div className="activation-text">The converter contract needs to accept ownership of the pool</div>
            <div className="activation-sub-text">Click below to activate your pool now.</div>
            </div>
          </Col>
        </Row>
        <Button onClick={this.props.activatePool} className="pool-activation-btn">Activate your pool</Button>
      </Container>
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
    const {pool: {poolCreationReceipt}} = this.props;
    let receiptObject = <span/>;
    if (isNonEmptyObject(poolCreationReceipt)) {
      receiptObject = (
        <div>
          <div className="h6">Your pool is now ready.</div>
          <div>Pool Name: {poolCreationReceipt.poolName}</div>
          <div>Pool Symbol: {poolCreationReceipt.poolSymbol}</div>
          <div>Connector Address: {poolCreationReceipt.connectorAdress}</div>
          <div>Weight: {poolCreationReceipt.connectorWeight}/{poolCreationReceipt.connectorWeight}</div>
          <div>Connector Balance: {poolCreationReceipt.connectorBalance}</div>
          <div></div>
          <div>Provide your pool address to Bancor developers channel for verification and addition to registry.</div>
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

class TokenFormRow extends Component {
  constructor(props) {
    super(props);
  }
  addressChanged = (evt) => {
    const {addressChanged, idx} = this.props;
    addressChanged(evt.target.value, idx);
  }
  
  addressOrSymbolSet = (evt) => {
    const {getTokenDetail, idx} = this.props;
    const value = evt.target.value;

    getTokenDetail(value, idx);
  }
  
  weightChanged = (evt) => {
    const {weightChanged, idx} = this.props;    
    weightChanged(evt.target.value, idx);
  }
  render() {
    const {address, weight, idx, addressChanged, weightChanged} = this.props;
    return (
        <Row>
        <Col lg={8}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Convertible Reserve Token Address</Form.Label>
          <Form.Control type="text" placeholder="address" value={address} onChange={this.addressChanged} onBlur={this.addressOrSymbolSet}/>
          <Form.Text className="text-muted">
            Enter the address of the ERC20 token contract for which you want to create pool.
          </Form.Text>
        </Form.Group>
        </Col>
        <Col lg={4}>
          <div className="slidecontainer">
          <Row>
            <Col lg={8}>
            Token Reserve Ratio
            </Col>
            <Col lg={4}>
            <Form.Control type="number" value={weight} onChange={this.weightChanged} className="amount-row"/>
            </Col>
            </Row>
            <Row>
            <input type="range" min="0" max="100" value={weight} className="slider"
            id="myRange" onChange={this.weightChanged}/>
            </Row>
          </div>           
        </Col>
        </Row>
      )
  }
}

class TokenAmountRow extends Component {
  constructor(props) {
    super(props);
    this.state = {tokenAmount: ''}
  }
  tokenAmountChanged = (evt) => {
    const {idx} = this.props;
    const tokenAmount = evt.target.value;
    
    this.setState({tokenAmount: tokenAmount});
    this.props.setTokenAmount(tokenAmount, idx);
  }
  
  render() {
    const {item} = this.props;
    const {tokenAmount} = this.state;
    return (
      <div>
        <Form.Group controlId="formFundingCenter">
          <Form.Label>Base token reserve amount to Transfer</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer" value={tokenAmount} 
          onChange={this.tokenAmountChanged} />
          <Form.Text className="text-muted">
            Enter amount of ${item.type} ERC20 token to transfer
          </Form.Text>
        </Form.Group>      
      </div>
      )
  }
}