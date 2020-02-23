import React, {Component} from 'react';
import {Form, Button, Container} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperAction,
  StepperContent,
  StepperContext
} from "react-material-stepper";
import 'react-material-stepper/dist/react-stepper.css';
import {deploySmartToken, deployConverter} from '../../utils/PoolUtils';

export default class CreateNewPool extends Component {
  constructor() {
    super();
    this.state = {stepOneReceipt: {}};
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  render() {
    const STEP1 = "step-one";
    const STEP2 = "step-two";
    const STEP3 = "step-three";
    const STEP4 = "step-four";

    return (
      <div className="current-selection-card">
      <Stepper>
        <Step
          stepId={STEP1}
          data="Step 1 initial state"
          title="Pool name"
          description="Pool name and symbol"
        >
          <Step1 handler={this.setStepOneReceipt}/>
        </Step>
        <Step stepId={STEP2} title="Converter details" description="Configure convertible token">
          <Step2 />
        </Step>
        <Step stepId={STEP3} title="Funding and initial supply" description="Fund pool with initial supply">
          <Step3 />
        </Step>
        <Step stepId={STEP4} title="Pool Activation" description="Activate your pool">
          <Step3 />
        </Step>        
      </Stepper>
      </div>
      )
  }
}



class Step1 extends Component {
  static contextType = StepperContext;
  
  constructor(props) {
    super(props);
    this.state = {poolName: '', poolSymbol: '', poolDecimals: 18}
  }
    
  onSubmit = (e) => {
    // e.preventDefault();
    // const self = this;
    // deploySmartToken(this.state).then(function(response){
    //   console.log(response);
    //   self.props.handler(response);
    //   self.context.resolve();
     
    // }).catch(function(err){
    //   console.log(err);
    // })
    
          this.context.resolve();
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
    
    return (
      <Container>
      <div className="create-form-container">
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
        
        <Button variant="primary" type="submit">
          Next
        </Button>
      </Form>
      </div>
      </Container>)
  }
}

class Step2 extends Component {
  constructor() {
    super();
    this.state = {};
  }
  
  componentWillMount() {
    this.setState({maxFee: 3, weight: 50, })
  }
  onSubmit = (e) => {
    
    // Hard code for dev remove later
    const smartTokenAddress = '0x5B840400ca832773c7aB9Ac7A6C94D5c82c9213F';
    const smartTokenSymbol = 'TSTBNT';
    const erc20ContractAddress = '0x00d811b7d33ceccfcb7435f14ccc274a31ce7f5d'; // Dai contract address hardcoded for now
    const conversionFee = 1000;
    
    const args = {
      tokenSymbol: smartTokenSymbol,
      maxFee: 3,
      reserveWeight: 50,
      convertibleWeight: 50,
      smartTokenAddress: smartTokenAddress,
      convertibleTokenAddress: erc20ContractAddress,
      conversionFee: conversionFee
    }
    
    e.preventDefault();
    deployConverter(args).then(function(dataResponse){

      const deployerContractAddress = dataResponse.contractAddress;
      
      
      
    }).catch(function(err){
      
    });
  }
  
  render() {
    return (
      <Container>
        <Form onSubmit={this.onSubmit}> 
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Contract Name</Form.Label>
          <Form.Control type="text" placeholder="name" readOnly="true"/>
          <Form.Text className="text-muted">
            Enter the address of the deployed token.
          </Form.Text>
        </Form.Group>
        
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Token Address</Form.Label>
          <Form.Control type="text" placeholder="name" />
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
    )
  }
}

class Step3 extends Component {
  render() {
    return (<div></div>)
  }
}