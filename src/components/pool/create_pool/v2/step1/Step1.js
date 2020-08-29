import React, {Component} from 'react';
import {  faPlus, faTimes, faQuestionCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import {Form, Button, Container, Row, Col, InputGroup, ButtonGroup, Tooltip, OverlayTrigger} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var _ = require('lodash');

const web3 = window.web3;

const SecondaryTokens = [
  {value: process.env.REACT_APP_BNT_ID_ROPSTEN, label: 'BNT'},
  {value: process.env.REACT_APP_BNT_ID_ROPSTEN, label: 'USDB'}
  ];
  
export default class Step1 extends Component {
  constructor(props) {
    super(props);
    this.state = {poolName: '', poolDecimals: 18, poolSymbol: '', primaryReserveAddress: '', secondaryReserveAddress: '',
      secondaryTokenSelected: SecondaryTokens[0]
    };
  }
  
  componentWillMmount() {
    const {secondaryTokenSelected} = this.state;
    const secondaryTokenSelectedAddress = secondaryTokenSelected.value;
    this.props.getTokenDetail(secondaryTokenSelectedAddress, 0);  
  }
  
  primaryReserveChanged = (evt) => {
    this.setState({primaryReserveAddress: evt.target.value});
  }
  
  secondayReserveChanged = (evt) => {
    this.setState({secondaryReserveAddress: evt.target.value});
  }
  
  secondaryReserveSet = (evt) => {
    const {getTokenDetail, idx} = this.props;
    const value = evt.target.value;
    getTokenDetail(value, 0);    
  }
  primaryReserveSet = (evt) => {
    const {getTokenDetail, idx} = this.props;
    const value = evt.target.value;
    getTokenDetail(value, 1);
  }
  
  componentWillReceiveProps(nextProps) {
    const {pool: {tokenList}} = nextProps;
    if (!_.isEqual(this.props.pool.tokenList, tokenList)) {
      const poolName = tokenList.data.name + ' Smart Relay Token';
      const poolSymbol = tokenList.data.symbol + 'BNT';
 
      this.setState({
        poolName: poolName,
        poolSymbol: poolSymbol
      }) 
    }
  }
  
  formDecimalsChanged = (evt) => {
    this.setState({poolDecimals: evt.target.value});  
  }
  
  createNewPool = () => {
    const {primaryReserveAddress, secondaryReserveAddress, poolName, poolSymbol,
      poolDecimals
    } = this.state;
    
    //this.props.setReserves({'primary'" });
    
    const payload = {
      poolType: '2',
      poolName: poolName,
      poolSymbol: poolSymbol,
      poolDecimals: poolDecimals,
      maxConversionFee: 3000,
      reserves: [primaryReserveAddress, secondaryReserveAddress],
      weights: [50, 50]
    }
    this.props.deployNewPool(payload);
  }
  
  render() {
    const {poolName, poolSymbol,poolSymbolDefault, poolDecimals, primaryReserveAddress, secondaryReserveAddress } = this.state;


    return (
        <div className="create-pool-form-container">

        <div className="create-form-container">

        <div className="step-header">
          <div className="h4">Creating Bancor V2 Pool</div>
          <div className="label-text">
            You can create a V2 pool with any 2 reserve tokens (BNT being the secondary reserve).
            <br/>You will need to provide Chainlink Oracle address (in the same denomination) for the reserves to activate the pool.
          </div>
        </div>
        
        <Container className="add-pool-converter-form">
        <Form onSubmit={this.onSubmit}>
  
          <div className="sub-form-header">
            Add primarily convertible token address
           <div>
           
            <Row>
              <Col lg={6}>
                Secondary reserve Token
          <Form.Control as="select" onChange={this.baseReserveChanged} selected={this.baseReserveSelected}>
            <option>BNT</option>
            <option>USDB</option>
          </Form.Control>
              </Col>
              <Col lg={6}>
                Reserve Ratio 
                <input type="range" min="0" max="100" value={50} className="slider" id="myRange" onChange={this.primaryWeightChanged}/>
              </Col>
            </Row>
            
            <Row>
              <Col lg={6}>
              <div>Primary Reserve Token</div>
                 <Form.Control className="" value={primaryReserveAddress} onChange={this.primaryReserveChanged} onBlur={this.reserveSet}/>
              </Col>
              <Col lg={6}>
                Reserve Ratio
               <input type="range" min="0" max="100" value={50} className="slider" id="myRange" onChange={this.primaryWeightChanged}/>
              </Col>
            </Row>

          </div>
        </div>
        <Row className="add-pool-form-header pool-detail-header">
          <Col lg={6}>
            <div className="header">
              Pool Details
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                Pool Name
              </Form.Label>
              <Form.Control type="text" placeholder="name" onChange={this.formNameChanged} value={poolName}/>
              <Form.Text className="text-muted" >
                Enter the pool name eg. XXX Smart Relay Token
              </Form.Text>
            </Form.Group>
          </Col>
          <Col lg={6}>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>
                Pool Symbol
              </Form.Label>
              <Form.Control type="text" placeholder="symbol" value={poolSymbol} onChange={this.formSymbolChanged} defaultValue={poolSymbolDefault}/>
              <Form.Text className="text-muted" >
                Enter the pool symbol eg. XXXYYY for pool with XXX and YYY.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col lg={6} xs={12}>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>
                Pool Decimals
              </Form.Label>
              <Form.Control type="text" placeholder="decimals" value={poolDecimals} onChange={this.formDecimalsChanged}/>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <Button variant="primary" className="pool-wizard-submit-btn" onClick={this.createNewPool}>
              Next
            </Button>
          </Col>
        <Col lg={8}>

        </Col>
        </Row>
        </Form>
        </Container>
        </div>
      </div>
   
  
      )
  }
}
 