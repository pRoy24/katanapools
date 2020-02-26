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
    this.state = {stepOneReceipt: {}, tokenName: '', isResolved: false, converibleTokenAddress: ''};
    this.appStepper = React.createRef();
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  
  deployConverterContract = (vals) => {
    const {pool: {smartTokenStatus, smartTokenContract}} = this.props;
    this.setState({convertibleTokenAddress: vals.convertibleTokenAddress, relayTokenAddress: smartTokenStatus.contractAddress});
    
    const args = {
      maxFee: 3,
      reserveWeight: 50,
      convertibleWeight: 50,
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
    console.log(this.state);
    
    const args = {
      convertibleTokenAmount: vals.tokenAmount,
      reserveTokenAmount: vals.connectorAmount,
      convertibleTokenAddress: convertibleTokenAddress,
      smartTokenAddress: relayTokenAddress,
      converterAddress: converterContractReceipt.contractAddress
    }

    this.props.fundRelayWithSupply(args);
  }
  
  componentWillReceiveProps(nextProps) {
    const {pool: {smartTokenContract, relayTokenStatus, poolFundedStatus}} = nextProps;

    if (!isEmptyObject(smartTokenContract) && isEmptyObject(this.props.pool.smartTokenContract)) {
      this.appStepper.current.resolve();
    }

    if (relayTokenStatus && relayTokenStatus.type === 'success' && this.props.pool.relayTokenStatus.type === 'pending') {
      this.appStepper.current.resolve();    
    }
    
    if (isNonEmptyObject(poolFundedStatus) && poolFundedStatus.type === 'success' && this.props.pool.poolFundedStatus.type === 'pending') {
      this.appStepper.current.resolve();          
    }
    
  }
  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";
    const STEP4 = "step-four";
    
    const {tokenName, isResolved} = this.state;
    const {pool: {isFetching, smartTokenStatus, symbol}, pool, deployPoolContract} = this.props;
    let transactionStatusMessage = <span/>;
    if (isFetching) {
      let message = <span/>;
      if (smartTokenStatus.message) {
        message = smartTokenStatus.message;
      }
      if (smartTokenStatus.transactionHash) {
        message = "Transaction broadcast" + smartTokenStatus.transactionHash;
      }
      transactionStatusMessage = (
          <Alert  variant={"info"}>
            <FontAwesomeIcon icon={faSpinner} size="lg" rotation={270} pulse/>&nbsp;
            {message}
          </Alert>
        )
    } else {
      
    }
    
    return (
      <div>
        <CreateNewPoolToolbar/>
        <div className="">
           {transactionStatusMessage}
        <Stepper contextRef={this.appStepper}>
          <Step
            stepId={STEP1}
            data="Step 1 initial state"
            title="Pool name"
            description="Pool name and symbol"
          >
            <Step1 handler={this.setStepOneReceipt} smartTokenStatus={pool.smartTokenStatus}
            isFetching={pool.isFetching} deployPoolContract={deployPoolContract} 
            isResolved={isResolved}/>
          </Step>
              <Step stepId={STEP2} title="Converter details" description="Configure convertible token">
              <Step2 tokenSymbol={symbol} pool={pool} deployContract={this.deployConverterContract}/>
          </Step>
          <Step stepId={STEP3} title="Funding and initial supply" description="Fund pool with initial supply">
            <Step3 fundRelayWithSupply={this.fundRelayWithSupply}/>
          </Step>
          <Step stepId={STEP4} title="Pool Activation" description="Activate your pool">
            <Step4 activatePool={this.activatePool} />
          </Step>        
        </Stepper>
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
          <Form.Label>Pool Symbol</Form.Label>
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
    this.state = {convertibleTokenAddress: ''};
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
  
  render() {
    const {tokenSymbol, convertibleTokenAddress} = this.props;
    
    return (
        <div className="create-pool-form-container">
              <Container>
        <Form onSubmit={this.onSubmit}> 
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Contract Name</Form.Label>
          <Form.Control type="text" placeholder="name" readOnly={true} value={tokenSymbol} onChange={this.tokenSymbolChanged}/>
          <Form.Text className="text-muted">
            Enter the address of the deployed token.
          </Form.Text>
        </Form.Group>
        
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Token Address</Form.Label>
          <Form.Control type="text" placeholder="address" value={convertibleTokenAddress} onChange={this.converterAddressChanged}/>
          <Form.Text className="text-muted">
            Enter the address of the deployed token.
          </Form.Text>
        </Form.Group>
        
        <div class="slidecontainer">
             <Form.Label>Reserve Ratio</Form.Label>
          <input type="range" min="30" max="50" value="50" className="slider" id="myRange"/>
        </div>
        <Button variant="primary" type="submit">
          Next
        </Button>
      </Form>
           </Container>
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
          <Form.Label>Contract Amount to Transfer</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer"  value={tokenAmount} 
          onChange={this.tokenAmountChanged}/>
          <Form.Text className="text-muted">
            Enter amount of token to transfer
          </Form.Text>
        </Form.Group>
        
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Dai Amount to Transfer</Form.Label>
          <Form.Control type="text" placeholder="Enter amount of connector token to transfer"
            value={connectorAmount} onChange={this.connectorAmountChanged}/>
          <Form.Text className="text-muted">
            Enter amount of token to transfer
          </Form.Text>
        </Form.Group>
        
                  <Form.Text className="text-muted">
            Please ensure that the USD value of convertible token and reserve token are roughly equal.
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
        <Button onClick={this.props.activatePool}>Activate your pool</Button>
      </Container>
      )
  }
}