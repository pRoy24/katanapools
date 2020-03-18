import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';
import Stepper, { Step } from "react-material-stepper";
import {
  StepperAction,
  StepperContent,
  StepperContext
} from "react-material-stepper";

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
      tokenAddressList: [], currentStep: 'step1',
    };
    this.appStepper = React.createRef();
  }
  setStepOneReceipt = (val) => {
    this.setState({stepOneReceipt: val});
  }
  deployPoolContract = (vals) => {
    if (isEmptyString(vals.poolName)) {
      this.setState({isError: true, errorMessage: 'Pool name cannot be empty'});
    } else if (isEmptyString(vals.poolSymbol)) {
      this.setState({isError: true, errorMessage: 'Pool symbol cannot be empty'});      
    } else {
      this.setState({isError: false});
      this.setState({poolName: vals.poolName, poolSymbol: vals.poolSymbol});
      this.props.deployPoolContract(vals);
    }
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
           'type': 'convertible'
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
      smartTokenAddress: smartTokenStatus.contractAddress,
      converterAddress: converterContractReceipt.contractAddress
    }
    
    this.props.activatePool(args);
  }
  
  fundRelayWithSupply = (vals) => {
    const self = this;
    const {pool, pool: {relayContractReceipt, converterContractReceipt}} = this.props;
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
      smartTokenAddress: relayTokenAddress,
      converterAddress: converterContractReceipt.contractAddress
    }
    if (!isValidationError) {
        this.setState({isError: false, errorMessage: ''});      
      this.props.fundRelayWithSupply(args);
    }
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
  // this.props.getTokenDetailFromAddress(val, idx);
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
          message = <div className="broadcast-container">Transaction broadcast <AddressDisplay address={smartTokenStatus.transactionHash}/></div>;
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
        <Stepper contextRef={this.appStepper} currentStep={currentStep}>
          <Step
            stepId={STEP1}
            data="Step 1 initial state"
            title="Pool name"
            description="Pool name and symbol">
            <Step1 handler={this.setStepOneReceipt} smartTokenStatus={pool.smartTokenStatus}
                   isFetching={pool.isFetching} deployPoolContract={this.deployPoolContract} 
                   isResolved={isResolved}/>
          </Step>
          <Step stepId={STEP2} data="Step 2 initial state" title="Converter details" description="Configure convertible token">
              <Step2 deployContract={this.deployConverterContract} getTokenDetail={this.getTokenDetail} setTokenListRow={this.props.setTokenListRow}/>
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
          <Form.Text className="text-muted" >
            Enter the pool symbol eg. XXXYYY for a relay with XXX and YYY
          </Form.Text>          
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
  constructor() {
    super();
    this.state = {convertibleTokenAddress: '', reserveFee: 0.1, tokenArrayList: [], baseReserveSelected: '',
    baseReserveWeight: '', poolType: 'relay'};
  }
  
  componentDidMount() {
    this.setState({maxFee: 3, weight: 50, tokenArrayList: [{'address': '', weight: 50}],
    baseReserveSelected: 'BNT', baseReserveWeight: 50});
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.props.deployContract(this.state);
  }
  
  reserveFeeChanged = (e) => {
    this.setState({reserveFee: e.target.value});
  }
  
  addReserveTokenRow = () => {
    const {poolType} = this.state;
    let currentRowList = this.state.tokenArrayList;
    let currentRowLength = currentRowList.length + 1;
    if (poolType === 'relay') {
      currentRowLength ++;
    }
    let newWeight = Math.floor(100 /  currentRowLength);

    currentRowList.push({'weight': '', 'address': ''});
    currentRowList = currentRowList.map(function(item){
      return Object.assign({}, item, {weight: newWeight});
    });
    
    if (poolType === 'relay') {
      this.setState({baseReserveWeight: newWeight});
    }
    
    this.setState({tokenArrayList: currentRowList});
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
    const baseWeightValue = evt.target.value;
    this.setState({baseReserveWeight: baseWeightValue});
  }
  
  togglePooltype = (val) => {
    let {tokenArrayList} = this.state;
    
    this.setState({poolType: val});
    if (val === 'relay') {
      //this.props.setTokenListRow();
    } else {
      if (tokenArrayList.length == 0) {
        tokenArrayList.push({address: '', weight: 50});
        this.setState({tokenArrayList: tokenArrayList});
      }
    }
  }

  removeTokenRow = (idx) => {
    let currentTokenAddressList = this.state.tokenArrayList;
    currentTokenAddressList.splice(idx, 1);
    this.setState({tokenArrayList: currentTokenAddressList});
  }
  
  render() {

    const {baseReserveWeight, reserveFee, tokenArrayList, poolType} = this.state;
    const {getTokenDetail} = this.props;
    let weightPromptMessage = <span/>;
    
    const self = this;
    
    let relaySelectButton = '';
    let ercSelectButton = '';
    
    if (poolType === 'relay') {
      relaySelectButton = 'button-active';
      ercSelectButton = ''; 
    } else {
      ercSelectButton = 'button-active'; 
    } 
    
    let tokenArrayListDisplay = tokenArrayList.map(function(item, idx){
      return <TokenFormRow key={`token-form-row-${idx}`} address={item.address} weight={item.weight ? item.weight : 0} idx={idx}
      weightChanged={self.weightChanged} addressChanged={self.addressChanged} getTokenDetail={getTokenDetail}
      removeTokenRow={self.removeTokenRow} poolType={poolType}/>;
    });
    
    let relayTokenRow = <span/>;
    if (poolType === 'relay') {
      relayTokenRow = (
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
        <Col lg={4} className="no-pad-col">
          <div className="slidecontainer">
          <Row>
            <Col lg={8}>
            Token Reserve Ratio
            </Col>
            <Col lg={4}>
            <Form.Control type="number" value={baseReserveWeight} onChange={this.baseWeightValueChanged} className="amount-row"/>
            </Col>
            </Row>
            <input type="range" min="0" max="100" value={baseReserveWeight} className="slider"
            id="myRange" onChange={this.baseWeightValueChanged}/>
          </div>        
        </Col>
        </Row>
        )
    }

function renderFeeTooltip(props) {
  return <Tooltip {...props}>
    <div>Low fee will encourage more conversions.</div>
    <div>A higher fee will encourage more liquidity to the pool.</div>
    </Tooltip>;
}

    return (
        <div className="create-pool-form-container">
      
        <div className="create-form-container">
          <Container className="add-pool-converter-form">
          <Row className="add-pool-form-header">
          <Col lg={6}>
          <div className="header">
            Pool composition 
          </div>
          </Col>
          <Col lg={6} className="btn-toggle-container no-pad-col">
            <ButtonGroup aria-label="Basic example">
              <Button variant="primary" onClick={()=>this.togglePooltype("relay")} className={`toggle-btn ${relaySelectButton}`}>Require relay token</Button>
              <Button variant="secondary" onClick={()=>this.togglePooltype("any")} className={`toggle-btn ${ercSelectButton}`}>Any ERC20 token</Button>
            </ButtonGroup>          
          </Col>
        </Row>
        </Container>
        <Container className="add-pool-converter-form">
        <Form onSubmit={this.onSubmit}> 
        {relayTokenRow}
        {tokenArrayListDisplay}
        <Button onClick={this.addReserveTokenRow} className="row-add-btn">Add another reserve token <FontAwesomeIcon icon={faPlus} /></Button>
        <Form.Group controlId="formBasicEmail" className="fees-row">
          <Form.Label>Conversion fees&nbsp; 
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderFeeTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle}/>
            </OverlayTrigger>
          </Form.Label>
            <InputGroup>
            <Form.Control type="text" placeholder="reserve fee" value={reserveFee} onChange={this.reserveFeeChanged}/>
            <InputGroup.Append>
              <InputGroup.Text id="inputGroupPrepend">%</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
          <Form.Text className="text-muted">
            Enter the conversion fees when using this reserve (Maximum 3%)
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
    this.props.fundRelayWithSupply({'tokenAddressList': this.state.tokenAddressList, initialSupply: this.state.numPoolTokens});
  }
  
  componentWillMount(){
    const currentAddressList = this.props.getAddressList();
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
  render() {
    const {tokenAmount, connectorAmount, tokenAddressList, numPoolTokens} = this.state;
    const self = this;
    let tokenAmountDisplay = tokenAddressList.map(function(item, key){
       return <TokenAmountRow key={`amount-row-${key}`} item={item} idx={key} setTokenAmount={self.setTokenAmount}/>      
    });

    return (
        <div className="create-pool-form-container">
        <Container>
        <Form onSubmit={this.onSubmit}> 
        
        {tokenAmountDisplay}
        
        <Form.Group controlId="formFundingCenter" className="pool-funding-form-row">
          <Form.Label>Number of pool tokens to issue</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer" value={numPoolTokens} 
          onChange={this.numPoolTokensChanged} />
          <Form.Text className="text-muted">
            Recommended to define an amount equal to the total $ value of all the reserves
          </Form.Text>
        </Form.Group>  
        
        <Form.Text className="text-muted">
            Please ensure that the USD value of all reserve tokens are roughly equal.
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
            <div className="activation-text">The converter contract needs to be added to the converter registry</div>
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
            </Row>
            <Row>
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
    const {address, weight, idx, addressChanged, weightChanged, poolType} = this.props;
    let removeRow = <FontAwesomeIcon icon={faTimes} className="remove-icon-btn" onClick={()=>this.props.removeTokenRow(idx)}/>;
    if (idx === 0 && poolType === 'any') {
      removeRow = <span/>;
    }
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
        <Col lg={4} className="token-weight-slider-container">
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
          {removeRow}
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
    const {idx, item} = this.props;
    const tokenAmount = evt.target.value;
    
    this.setState({tokenAmount: tokenAmount});
    this.props.setTokenAmount(tokenAmount, idx);
    this.setState({tokenUSDValue: (parseFloat(item.price) * tokenAmount).toFixed(2)})
  }
  
  componentWillMount() {
    const {item, idx} = this.props;
    let tokenAmount = (1 / item.price).toFixed(2);
    this.setState({tokenAmount: tokenAmount});
    this.props.setTokenAmount(tokenAmount, idx);
    this.setState({tokenUSDValue: parseFloat(1).toFixed(2)})
  }
  render() {
    const {item} = this.props;
    const {tokenAmount, tokenUSDValue} = this.state;
    return (
      <div>
        <Form.Group controlId="formFundingCenter" className="pool-funding-form-row">
          <Form.Label>Amount of {item.symbol} to transfer. 1 {item.symbol} = {item.price} USD.</Form.Label>
          <Form.Control type="text" placeholder="enter amount of token to transfer" value={tokenAmount} 
          onChange={this.tokenAmountChanged} />
          <Form.Text className="text-muted">
            Total USD value = {tokenUSDValue}. Your wallet balance {item.senderBalance}
          </Form.Text>
        </Form.Group>      
      </div>
      )
  }
}