import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperAction,
  StepperContent,
  StepperContext
} from "react-material-stepper";
import {isEmptyObject, isNonEmptyObject} from '../../../utils/ObjectUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight,  faChevronCircleDown, faSpinner } from '@fortawesome/free-solid-svg-icons'
import 'react-material-stepper/dist/react-stepper.css';
import {deploySmartToken, deployConverter} from '../../../utils/PoolUtils';
import CreateNewPoolToolbar from './CreateNewPoolToolbar';

export default class CreateNewPool extends Component {
  static contextType = StepperContext;
  constructor(props) {
    super(props);
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: '',
                  poolName: '', poolSymbol: '', showReceiptPage: false};
    this.appStepper = React.createRef();
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  deployPoolContract = (vals) => {
    this.setState({poolName: vals.poolName, poolSymbol: vals.poolSymbol});
    this.props.deployPoolContract(vals);
  }
  
  deployConverterContract = (vals) => {
    const {pool: {smartTokenStatus, smartTokenContract}} = this.props;
    this.setState({convertibleTokenAddress: vals.convertibleTokenAddress, relayTokenAddress: smartTokenStatus.contractAddress});

    const args = {
      maxFee: 3,
      reserveWeight: vals.weightValue,
      convertibleWeight: vals.weightValue,
      smartTokenAddress: smartTokenStatus.contractAddress,
      convertibleTokenAddress: vals.convertibleTokenAddress,
      conversionFee: 1000
    }
    
    this.props.deployRelayConverter(args);
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
      this.appStepper.current.resolve();
    }

    if (isNonEmptyObject(relayConverterStatus) && relayConverterStatus.type === 'success' && this.props.pool.relayConverterStatus.type === 'pending') {
      this.appStepper.current.resolve();    
    }
    
    if (isNonEmptyObject(poolFundedStatus) && poolFundedStatus.type === 'success' && this.props.pool.poolFundedStatus.type === 'pending') {
      this.appStepper.current.resolve();          
    }

    if (isNonEmptyObject(this.props.pool.activationStatus) && activationStatus.type === 'success' &&
    this.props.pool.activationStatus.type === 'pending') {
      this.setState({showReceiptPage: true});
    }
  }
  

  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";
    const STEP4 = "step-four";
    
    const {poolSymbol, isResolved, showReceiptPage} = this.state;

    const {pool: {isFetching, smartTokenStatus, relayConverterStatus, poolFundedStatus}, pool,} = this.props;
    let transactionStatusMessage = <span/>;
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
    let currentPage = <span/>;
    if (showReceiptPage === false) {
      currentPage = (
        <Stepper contextRef={this.appStepper}>
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
              <Step2 tokenSymbol={poolSymbol} pool={pool} deployContract={this.deployConverterContract}/>
          </Step>
          <Step stepId={STEP3} title="Funding and initial supply" description="Fund pool with initial supply">
            <Step3 fundRelayWithSupply={this.fundRelayWithSupply}/>
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
    this.state = {convertibleTokenAddress: '', weightValue: 50};
  }
  
  componentWillMount() {
    this.setState({maxFee: 3, weight: 50, })
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.props.deployContract(this.state);
    
  }
  
  tokenSymbolChanged = () => {
    // Readonly value nothing to do
  }
  
  converterAddressChanged = (e) => {
    this.setState({convertibleTokenAddress: e.target.value});
  }
  
  sliderValueChanged = (e) => {
    this.setState({weightValue: e.target.value});
  }
  
  render() {
    const {tokenSymbol, convertibleTokenAddress} = this.props;
    const {weightValue} = this.state;
    let weightPromptMessage = <span/>;
    if (weightValue === 50) {
      weightPromptMessage = (
        <div>
          <div>
            You are creating a pool with 50/50 reserve.
          </div>
          <div className="weight-subtext">
            Your pool token will remain relatively stable as liquidity is added or removed.
          </div>
        </div>
        )
    } else if (weightValue < 50) {
      weightPromptMessage = (
        <div>
          <div>
            You are creating a pool with {weightValue}/{weightValue} reserve.
          </div>
          <div className="weight-subtext">
            Your pool token will increase in value as liquidity is added and decrease in value as liquidity is removed.
          </div>
        </div>
        )      
    }
    return (
        <div className="create-pool-form-container">
        <div className="create-form-container">
        <Container>
        <Form onSubmit={this.onSubmit}> 
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Network reserve token</Form.Label>
          <Form.Control type="text" placeholder="symbol" readOnly={true} value={"BNT"} onChange={this.tokenSymbolChanged}/>
        </Form.Group>
        
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Convertible Reserve Token Address</Form.Label>
          <Form.Control type="text" placeholder="address" value={convertibleTokenAddress} onChange={this.converterAddressChanged}/>
          <Form.Text className="text-muted">
            Enter the address of the ERC20 token contract for which you want to create pool.
          </Form.Text>
          
        </Form.Group>

        <Row className="form-submit-container">
        <Col lg={6} xs={12}>
          <div className="slidecontainer">
            <Form.Label>{`Reserve Ratio for pool. ${weightValue}/${weightValue}`}</Form.Label>
            <input type="range" min="30" max="50" value={weightValue} className="slider"
            id="myRange" onChange={this.sliderValueChanged}/>
          </div>
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
    this.props.fundRelayWithSupply(this.state);
  }
  
  render() {
    const {tokenAmount, connectorAmount} = this.state;
    
    return (
        <div className="create-pool-form-container">
        <Container>
        <Form onSubmit={this.onSubmit}> 
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Base token reserve amount to Transfer</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer"  value={tokenAmount} 
          onChange={this.tokenAmountChanged}/>
          <Form.Text className="text-muted">
            Enter amount of convertible ERC20 token to transfer
          </Form.Text>
        </Form.Group>
        
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Network token reserve amount to transfer</Form.Label>
          <Form.Control type="text" placeholder="Enter amount of connector token to transfer"
            value={connectorAmount} onChange={this.connectorAmountChanged}/>
          <Form.Text className="text-muted">
            Enter amount of network token (BNT) to transfer
          </Form.Text>
        </Form.Group>
        
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