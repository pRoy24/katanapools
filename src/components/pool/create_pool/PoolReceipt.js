import React, {Component} from 'react';
import {Container, Row, Col, FormControl, Button, Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddressDisplay from '../../common/AddressDisplay';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import {isNonEmptyArray, isEmptyArray, isEmptyObject, isNonEmptyObject} from '../../../utils/ObjectUtils';
import {toDecimals} from '../../../utils/eth';


export default class PoolReceipt extends Component {
  constructor(props) {
    super(props);
    this.state = {setConversionFeeVisible: false, setFundingDisplayVisible: false, conversionFee: 0,
      reserves:[]
    };
  }
  
  conversionFeeUpdated = (evt) => {
    this.setState({conversionFee: evt.target.value});
  }
  
  componentWillReceiveProps(nextProps) {
      const {pool: {createPool}} = nextProps;
      if (isNonEmptyObject(createPool) && isEmptyObject(this.props.pool.createPool) && createPool.reserves.length > 0) {
        
        const reserveList = createPool.reserves.map(function(rItem){
          return Object.assign({}, rItem, {amount: 0});
        });
        this.setState({reserves: reserveList});
      }
  }
  
  componentWillMount() {
    const {pool: {relayConverterStatus}} = this.props;
    console.log(relayConverterStatus);
    const self = this;
    const converterAddress = relayConverterStatus.message.events["1"].address;
    const smartTokenAddress = relayConverterStatus.message.events.SmartTokenAdded.returnValues._smartToken;

        const convertibleTokens = relayConverterStatus.message.events.ConvertibleTokenAdded.map(function(item){
          return item.returnValues._convertibleToken;
        })
        
    setTimeout(function(){
       self.props.fetchPoolDetails({'pool': smartTokenAddress, 'converter': converterAddress, 'reserves': convertibleTokens})
       
    }, 4000);
  }
    
    toggleExpandSetConversionFee = () => {
      this.setState({setConversionFeeVisible: !this.state.setConversionFeeVisible});
    }
    
    toggleExpandSetFunding = () => {
      this.setState({setFundingDisplayVisible: !this.state.setFundingDisplayVisible});
    }
    
    updateConversionFee =() => {
          const {pool: {relayConverterStatus, activationStatus, createPool}} = this.props;
      const {conversionFee} = this.state;
      const converterAddress = relayConverterStatus.message.events["1"].address;
      this.props.setConversionFee(converterAddress, conversionFee);    
    }
    
    updateTokenAmount = (amount, idx) => {
      let {reserves} = this.state;
      reserves[idx].amount = amount;
      this.setState({reserves: reserves});
    }
    
    updatePoolFunding = () => {
      const {reserves} = this.state;
          const {pool: {relayConverterStatus, activationStatus, createPool}} = this.props;
      const converterAddress = relayConverterStatus.message.events["1"].address;
      const reserveMap = reserves.map(function(item){
        return item.data.address;
      });
      const amountMap = reserves.map(function(item){
        console.log(item)
        return toDecimals(item.amount, item.data.decimals);
      });
      console.log(reserveMap);
      console.log(amountMap);
      this.props.approveAndFundPool(reserveMap, amountMap, converterAddress);
    }
    
    render() {
        const {pool: {createPool, relayConverterStatus}} = this.props;
        const {setConversionFeeVisible, setFundingDisplayVisible, conversionFee, reserves} = this.state;
        const converterAddress = relayConverterStatus.message.events["1"].address;
        const smartTokenAddress = relayConverterStatus.message.events.SmartTokenAdded.returnValues._smartToken; 

        let reserveDetails = <span/>;
        if (createPool && reserves.length > 0) {
          reserveDetails = createPool.reserves.map(function(item, idx){
            return <Col lg={4} xs={4}>
             <div className="cell-label">{item.data.symbol}</div>
             <div className="cell-data"><AddressDisplay address={item.data.address}/></div>
            </Col>
          })
        }
        
        let conversionFeeDisplay = <span/>;
        if (setConversionFeeVisible) {
          conversionFeeDisplay = (
            <Row className="set-pool-container">
              <Col lg={10} xs={10}> 
             <Form.Control type="text" placeHolder="Set pool conversion fees, maximum 3%"
             value={conversionFee} onChange={this.conversionFeeUpdated}/>
             </Col>
             <Col lg={2} xs={2}>
             <Button onClick={this.updateConversionFee}>Update</Button>
             </Col>
            </Row>
            )
        }
        
        let fundingDisplay = <span/>;
        const self = this;
        if (setFundingDisplayVisible && reserves.length > 0) {
          fundingDisplay = (
            <Row className="set-pool-container">
              {createPool.reserves.map(function(item, idx) {
                return <Col lg={12} xs={12}>
                <TokenAmountRow item={item.data} idx={idx} updateTokenAmount={self.updateTokenAmount}/>
                </Col>
              })}
             <Col lg={2} xs={2}>
             <Button onClick={this.updatePoolFunding}>Update</Button>
             </Col>
            </Row>            
            )
        }
        return (
        <div className="create-pool-form-container app-toolbar-container">
        <Container>
              <div className="header">
                Congratulations !! Your pool has been deployed successfully.
              </div>
              <div>
              <Row className="sub-header">
                <Col lg={12} xs={12}>
                  Pool Details
                </Col>
              </Row>
              <Row>
                <Col lg={6}>
                  <div className="cell-label">
                  Pool Token Address
                  </div>
                  <div className="cell-data">
                  {smartTokenAddress}
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="cell-label">
                  Pool Converter Address
                  </div>
                  <div className="cell-data">
                  {converterAddress}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col lg={4} xs={4}>
                  <div className="cell-label">
                  Name
                  </div>
                  <div className="cell-data">
                  {createPool.name}
                  </div>
                </Col>
                <Col lg={4} xs={4}>
                <div className="cell-label">
                  Symbol
                    </div>
                 <div className="cell-data">  
                  {createPool.symbol}
                  </div>
                </Col>
                <Col lg={4} xs={4}>
                <div className="cell-label">
                  Supply
                      </div>
                      <div className="cell-data">      
                  {createPool.supply}
                   </div>
                </Col>
              </Row>
              <Row className="sub-header">
                <Col lg={12} xs={12}>
                  Pool Reserves
                </Col>
              </Row>              
              <Row>
                  {reserveDetails}
              </Row>
              
              <Row>
                <Col lg={12} className="sub-header">
                  Next steps
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.toggleExpandSetConversionFee}>
                    Set Pool conversion fees <FontAwesomeIcon icon={faChevronDown} />
                  </div>
                  {conversionFeeDisplay}
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.toggleExpandSetFunding}>
                  Add initial pool liquidity <FontAwesomeIcon icon={faChevronDown}/>
                  </div>
                  {fundingDisplay}
                </Col>
                <Col lg={12} className="app-next-step-col">
                  <div onClick={this.gotoPoolPage}>
                  View your pool <FontAwesomeIcon icon={faChevronRight}/>
                  </div>
                </Col>
              </Row>
              </div>
              </Container>
            </div>
            )
    }
}

class TokenAmountRow extends Component {
  constructor(props) {
    super(props);
    this.state = {tokenAmount: ''};
  }
  
  tokenAmountChanged = (evt) => {
    const {idx} = this.props;
    const amount = evt.target.value;
    this.props.updateTokenAmount(amount, idx);
  }
  render() {
    const {tokenAmount} = this.props;
    const {item} = this.props;
    let tokenUSDValue = 0;
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