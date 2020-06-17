import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, InputGroup, ButtonGroup, Tooltip, OverlayTrigger} from 'react-bootstrap';
import {getReserveTokenNameAndSymbol} from '../../../../../utils/ConverterUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faTimes, faQuestionCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default class Step1 extends Component {
  constructor() {
    super();
    this.state = {convertibleTokenAddress: '', reserveFee: 0.1, tokenArrayList: [], baseReserveSelected: '',
    baseReserveWeight: '', poolType: 'relay', poolName: '', poolSymbol: '', poolDecimals: 18, txMsg: {}, detailsVisible: false};
  }

  componentDidMount() {
    this.setState({maxFee: 3, weight: 50, tokenArrayList: [{'address': '', weight: 50}],
    baseReserveSelected: 'BNT', baseReserveWeight: 50, detailsVisible: false});
  }
  onSubmit = (e) => {
    e.preventDefault();
    this.props.deployContract(this.state);
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
  reserveFeeChanged = (e) => {
    this.setState({reserveFee: e.target.value});
  }

  toggleDetailsBox = () => {
    this.setState({detailsVisible: !this.state.detailsVisible});
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
    const self = this;
    this.setState({poolType: val}, function(){
      self.setPoolNameAndSymbol(tokenArrayList);
    });
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
    const {poolType, baseReserveSelected} = this.state;
    const self = this;
    let currentTokenAddressList = this.state.tokenArrayList;
    currentTokenAddressList.splice(idx, 1);
    self.setPoolNameAndSymbol(currentTokenAddressList);
    self.setState({tokenArrayList: currentTokenAddressList});

  }

  setPoolNameAndSymbol = (newTokenAddressList) => {
    const {poolType, baseReserveSelected} = this.state;
    const self = this;


    let poolNameDefault = "";
    let poolSymbolDefault = "";
    let poolTypeIdentifier = "Relay";
      if (newTokenAddressList && newTokenAddressList.length > 0) {
      newTokenAddressList.forEach(function(tokenItem, idx){
        if (tokenItem.name && tokenItem.symbol) {
          poolNameDefault += " " + tokenItem.name.split(" ")[0];
          poolSymbolDefault += tokenItem.symbol;
          if (tokenItem.weight !== 50) {
            poolTypeIdentifier = "Pool";
          }
        }
      });
      if (poolType === 'relay') {
        poolSymbolDefault += baseReserveSelected;
      }
      poolNameDefault += ` Smart ${poolTypeIdentifier} Token`;
      poolNameDefault = poolNameDefault.trim();
      if ((poolType === 'relay' && newTokenAddressList.length >= 1) || newTokenAddressList.length >= 2) {
        self.setState({ poolName: poolNameDefault, poolSymbol: poolSymbolDefault})
      } else {
         self.setState({ poolName: '', poolSymbol: ''});
      }
      }
  }

  getTokenNameAndSymbol = (val, idx) => {
    const {tokenArrayList} = this.state;
    const self = this;
    if (val && val.length > 0) {
    getReserveTokenNameAndSymbol(val).then(function(response){
      self.props.resetFormError();
      tokenArrayList[idx].symbol = response.symbol;
      tokenArrayList[idx].name = response.name;
      self.setPoolNameAndSymbol(tokenArrayList);
      self.setState({tokenArrayList: tokenArrayList});
    }).catch(function(err){
      self.props.setFormError(err.toString());
    })
    }
  }

  render() {

    const {baseReserveWeight, tokenArrayList, poolType, poolSymbolDefault, detailsVisible} = this.state;
    const { isError, pool: {relayConverterStatus}} = this.props;
    const {poolName, poolSymbol, poolDecimals} = this.state;

    const self = this;
    let isCreationStepPending = false;
    if (relayConverterStatus && relayConverterStatus.type === 'pending') {
      isCreationStepPending = true;
    }
    let relaySelectButton = '';
    let ercSelectButton = '';

    if (poolType === 'relay') {
      relaySelectButton = 'button-active';
      ercSelectButton = '';
    } else {
      ercSelectButton = 'button-active';
    }

    let tokenArrayListDisplay = tokenArrayList.map(function(item, idx){
      return <TokenFormRow key={`token-form-row-${idx}`} address={item.address}
      symbol={item.symbol} name={item.name}
      weight={item.weight ? item.weight : 0} idx={idx}
      weightChanged={self.weightChanged} addressChanged={self.addressChanged} getTokenDetail={self.getTokenNameAndSymbol}
      removeTokenRow={self.removeTokenRow} poolType={poolType}/>;
    });

    let relayTokenRow = <span/>;
    if (poolType === 'relay') {
      relayTokenRow = (
      <Row>
        <Col lg={8}>
        <Form.Group controlId="formBasicEmail">
         <Form.Label>Select network hub token.
           <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderNetworkHubTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
            </Form.Label>
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
           <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={reserveRatioTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
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

function reserveRatioTooltip(props) {
   return <Tooltip {...props}>
    <div>
    Reserve ratio defines the ratio between the total value of the reserves & the market cap of the pool token.
    </div>
    <div>
    While most pools have a network hub token and a pool token kept in a 50/50 reserve ratio,
    </div>
    <div>
     You can also create pools with an array of reserves in any arbitrary reserve ratio.
    </div>
    <div>
    Provided the sum of all reserves is less than or equal to 100.
    </div>

    </Tooltip>;
}

function renderNameTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Pool name should be descriptive of the pool reserves to allow for easy searching and indexing.</div>
    <div>For instance, a pool name like Link Bat Smart Relay Token could refer to a pool with LINK, BAT, BNT in a 33/33/33 reserve ratio.</div>
    </div>
    </Tooltip>;
}


function renderSymbolTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Pool symbol should contain the symbols of pool reserves to allow for easy searching and indexing.</div>
    <div>For instance, a pool symbol like LINKBATBNT could refer to a pool with LINK, BAT, BNT in a 33/33/33 reserve ratio.</div>
    </div>
    </Tooltip>;
}

function renderDecimalTooltip(props) {
  return <Tooltip {...props} className="wizard-tooltip">
    <div className="wizard-tooltip-text">
    <div>Decimal precision of pool token.</div>
    <div>The standard is 18 for most ERC20 tokens.</div>
    <div>If you are unsure of what value to enter leave it at 18.</div>
    </div>
    </Tooltip>;
}

function renderNetworkHubTooltip(props) {
  return <Tooltip {...props}>
    <div>A network hub token is a token which allows interconversion of tokens between pools.</div>
    <div>For instance any token XXX can be converted to token YYY provided pool XXXBNT and YYYBNT exists.</div>
    <div>This is done by following a conversion path as XXX -> XXXBNT -> BNT -> YYYBNT -> YYY</div>
    </Tooltip>;
}
function renderFeeTooltip(props) {
  return <Tooltip {...props}>
    <div>Low fee will encourage more conversions whereas a higher fee will encourage more liquidity to the pool.</div>
    <div>Most pools follow a standard 0.1% conversion fees.</div>
    </Tooltip>;
}

function renderConvertibleTokenTooltip(props) {
  return <Tooltip {...props}>
    <div>Convertible tokens are ERC20 tokens </div>
    <div>which can be converted to other tokens in the pool</div>
    <div>or to other tokens via the intermediary network hub token.</div>
    <div>(provided pool contains at least 1 network hub token)</div>
    </Tooltip>;
}

    let isFormInComplete = true;
    if (poolName.length > 0 && poolSymbol.length > 0) {
      isFormInComplete = false;
    }

    let isSubmitBtnDisabled = isCreationStepPending || isFormInComplete;
    let numTransactions = tokenArrayList.length + 3;
    let transactionDetails = <span/>;
    if (detailsVisible) {
      transactionDetails = (
        <div>
          <div>1 transction for Pool token contract deployment.</div>
          <div>1 transaction for Pool converter deployment.</div>
          <div>1 transaction for setting pool conversion fees.</div>
          <div>{tokenArrayList.length} transactions for adding connectors for each of the ERC20 tokens</div>
        </div>
        )
    }
    return (
        <div className="create-pool-form-container">

        <div className="create-form-container">
          <Container className="add-pool-converter-form">
          <Row className="add-pool-form-header">
          <Col lg={6}>
          <div className="header">
            Pool Reserve Ratio<div className="help-link-text">
            <a href="https://katanapools.com/help/reserveratio" target="_blank">What is reserve ratio</a></div>
          </div>
          </Col>
          <Col lg={6} className="btn-toggle-container no-pad-col">
            <ButtonGroup aria-label="Basic example">
              <Button variant="primary" onClick={()=>this.togglePooltype("relay")} className={`toggle-btn ${relaySelectButton}`}>Require network hub token</Button>
              <Button variant="secondary" onClick={()=>this.togglePooltype("any")} className={`toggle-btn ${ercSelectButton}`}>Any ERC20 token</Button>
            </ButtonGroup>
          </Col>
        </Row>
        </Container>
        <Container className="add-pool-converter-form">
        <Form onSubmit={this.onSubmit}>
        {relayTokenRow}
        <div className="sub-form-header">
            Add convertible tokens
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderConvertibleTokenTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
        </div>
        {tokenArrayListDisplay}
        <Button onClick={this.addReserveTokenRow} className="row-add-btn">Add another reserve token <FontAwesomeIcon icon={faPlus} /></Button>
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
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderNameTooltip}>
                <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
              </OverlayTrigger>
            </Form.Label>
            <Form.Control type="text" placeholder="name" onChange={this.formNameChanged} value={poolName}/>
            <Form.Text className="text-muted" >
              Enter the pool name eg. XXX Smart Relay Token
            </Form.Text>
          </Form.Group>
          </Col>
          <Col lg={6}>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Pool Symbol
                <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={renderSymbolTooltip}>
                <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
              </OverlayTrigger>
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
          <Form.Label>Pool Decimals
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={renderDecimalTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
          </Form.Label>
          <Form.Control type="text" placeholder="decimals" value={poolDecimals} onChange={this.formDecimalsChanged}/>
        </Form.Group>
        </Col>
        </Row>
        <Row>
        <Col lg={4}>
        {isError ?

        <Button className="pool-wizard-submit-btn" type="submit" variant="primary">
          Resume
        </Button>
        :
        <Button variant="primary" disabled={isSubmitBtnDisabled} type="submit" className="pool-wizard-submit-btn">
          Next
        </Button>
        }
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
    const {address, weight, idx, addressChanged, weightChanged, poolType, symbol, name} = this.props;
    let removeRow = <FontAwesomeIcon icon={faTimes} className="remove-icon-btn" onClick={()=>this.props.removeTokenRow(idx)}/>;
    if (idx === 0 && poolType === 'any') {
      removeRow = <span/>;
    }
function reserveRatioTooltip(props) {
   return <Tooltip {...props}>
    <div>
    Reserve ratio defines the ratio between the total value of the reserves & the market cap of the pool token.
    </div>
    <div>
    While most pools have a network hub token and a pool token kept in a 50/50 reserve ratio,
    </div>
    <div>
     You can also create pools with an array of reserves in any arbitrary reserve ratio.
    </div>
    <div>
    Provided the sum of all reserves is less than or equal to 100.
    </div>

    </Tooltip>;
}
    let tokenDetails = <span/>;;
    if (symbol && name) {
      tokenDetails = <div>Symbol: {symbol} Name: {name}</div>
    }
    return (
        <Row>
        <Col lg={8}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Convertible Reserve Token Address</Form.Label>
          <Form.Control type="text" placeholder="address of the ERC20 token contract" value={address} onChange={this.addressChanged} onBlur={this.addressOrSymbolSet}/>
          <Form.Text className="text-muted">
            {tokenDetails}
          </Form.Text>
        </Form.Group>
        </Col>
        <Col lg={4} className="token-weight-slider-container">
          <div className="slidecontainer">
          <Row>
            <Col lg={8} className="reserve-ratio-field-container">
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
