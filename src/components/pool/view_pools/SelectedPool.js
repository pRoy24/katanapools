import React, {Component} from 'react';
import {Container, Row, Col, Form, Button} from 'react-bootstrap';
import AddressDisplay from '../../common/AddressDisplay';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {VictoryChart, VictoryLine} from 'victory';
const BigNumber = require('bignumber.js');

export default class SelectedPool extends Component {
  constructor(props) {
    super(props);
    this.state= {fundAmount: 0, liquidateAmount: 0, reserve1Needed: 0, reserve2Needed: 0}
  }
  

  onFundInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.calculateAmount(inputFund);
    this.setState({fundAmount: inputFund});
  }
  
  onLiquidateInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.calculateLiquidateAmount(inputFund);
    this.setState({liquidateAmount: inputFund});
  }
  
  calculateLiquidateAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;

    const totalSupply = new BigNumber(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
    const removeSupply = new BigNumber(inputFund);
    const newTotalSupply = totalSupply.minus(removeSupply);
    
    const pcDecreaseSupply = removeSupply.dividedBy(newTotalSupply);
    
    const reserve1CurrentSupply = new BigNumber(fromDecimals(currentSelectedPool.reserves[0].reserveBalance, 18));
    
    let reserve1Added = pcDecreaseSupply.multipliedBy(reserve1CurrentSupply);
    
    const reserve2CurrentSupply = new BigNumber(fromDecimals(currentSelectedPool.reserves[1].reserveBalance, 18));
    let reserve2Added = pcDecreaseSupply.multipliedBy(reserve2CurrentSupply);    
    
     reserve1Added = reserve1Added.toPrecision(4, 0);
     reserve2Added = reserve2Added.toPrecision(4, 0);
    this.setState({
      reserve1AddedMin: toDecimals(reserve1Added, 18),
      reserve1Added: reserve1Added, reserve2AddedMin: toDecimals(reserve2Added, 18),
      reserve2Added: reserve2Added, }) ;
   
  }
  
  calculateAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;

    const totalSupply = new BigNumber(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));
    const addSupply = new BigNumber(inputFund);
    const newTotalSupply = totalSupply.plus(addSupply);

    const pcIncreaseSupply = addSupply.dividedBy(newTotalSupply);

    const reserve1CurrentSupply = new BigNumber(fromDecimals(currentSelectedPool.reserves[0].reserveBalance, 18));

    let reserve1Needed = pcIncreaseSupply.multipliedBy(reserve1CurrentSupply);
    
    
    const reserve2CurrentSupply = new BigNumber(fromDecimals(currentSelectedPool.reserves[1].reserveBalance, 18));
    let reserve2Needed = pcIncreaseSupply.multipliedBy(reserve2CurrentSupply);
    
   reserve1Needed = reserve1Needed.toPrecision(4, 0);
    reserve2Needed = reserve2Needed.toPrecision(4, 0);

    
   this.setState({
     reserve1NeededMin: toDecimals(reserve1Needed, 18),
    reserve1Needed: reserve1Needed, reserve2NeededMin: toDecimals(reserve2Needed, 18),
   reserve2Needed: reserve2Needed, }) ;
  }

  
  submitBuyPoolToken = () => {

    const {reserve1NeededMin, reserve2NeededMin, fundAmount} = this.state;
    const {pool: {currentSelectedPool}} = this.props;

    const reserve1 = {'address': currentSelectedPool.reserves[0].address, 'amount': reserve1NeededMin,
      isEth: currentSelectedPool.reserves[0].symbol.toLowerCase() === 'eth'};
    
    const reserve2 = {'address': currentSelectedPool.reserves[1].address, 'amount': reserve1NeededMin,
      isEth: currentSelectedPool.reserves[1].symbol.toLowerCase() === 'eth'};
      
    const args = {'reserve1':  reserve1, 'reserve2': reserve2, poolTokenNeeded: toDecimals(fundAmount, 18),
    'converterAddress': currentSelectedPool.converter
    }
    this.props.submitPoolBuy(args);
  }
  
  submitSellPoolToken = () => {
    const {pool: {currentSelectedPool, currentSelectedPoolError}} = this.props;
        
    const {liquidateAmount} = this.state;
    const args = {poolTokenSold: toDecimals(liquidateAmount, currentSelectedPool.decimals),
      'converterAddress': currentSelectedPool.converter,
      'poolAddress': currentSelectedPool.address,
    };
    this.props.submitPoolSell(args);
  }
  
  render() {
    const {pool: {currentSelectedPool, currentSelectedPoolError}, pool} = this.props;
    let reserveRatio = '';
    if (currentSelectedPool.reserves[0].reserveRatio && currentSelectedPool.reserves[1].reserveRatio) {
      reserveRatio = parseInt(currentSelectedPool.reserves[0].reserveRatio)/10000 + '/' + parseInt(currentSelectedPool.reserves[1].reserveRatio)/10000;
    }
    if (currentSelectedPoolError) {
      return (<div>
      <div>Could not fetch pool details.</div>
      <div>Currently only pool contracts which expose reserveTokenCount() and reserveTokens() methods are supported.</div>
      </div>)
    }
    const {reserve1Needed, reserve2Needed, reserve1Added, reserve2Added, fundAmount, liquidateAmount} = this.state;
    let minTotalSupply = parseFloat(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals)).toFixed(4);
    let reserveTokenList = currentSelectedPool.reserves.map(function(item, idx){
      return <div key={`token-${idx}`}>{item.name}</div>
    })
    let poolHoldings = parseFloat(fromDecimals(currentSelectedPool.senderBalance, currentSelectedPool.decimals)).toFixed(4);
    
    let liquidateInfo = <span/>;
    if (liquidateAmount && liquidateAmount > 0) {
      liquidateInfo = (
        <div>
          <div>You will receive</div>
          <div>{reserve1Added} {currentSelectedPool.reserves[0].symbol}</div>
          <div>{reserve2Added} {currentSelectedPool.reserves[1].symbol}</div>
        </div>    
        )
    }
    let fundInfo = <span/>;
    let poolFee = "3";
    
    if (fundAmount && fundAmount > 0) {
      fundInfo = (
        <div>
            <div>You will needs to stake</div>
            <div>{reserve1Needed} {currentSelectedPool.reserves[0].symbol}</div>
            <div>{reserve2Needed} {currentSelectedPool.reserves[1].symbol}</div>
        </div>    
        )
    }
    return (
      <div>
        <Row className="select-pool-row-1">
          <Col lg={1} className="pool-logo-container">
            <img src={currentSelectedPool.imageURI} className="selected-pool-image"/>
          </Col>
          <Col lg={2}>
            <div className="cell-label">{currentSelectedPool.symbol}</div>
            <div className="cell-data">{currentSelectedPool.name}</div>
          </Col>
          <Col lg={2}>
           <div className="cell-label">Address</div>
           <div className="cell-data"><AddressDisplay address={currentSelectedPool.address}/></div>
          </Col>
          <Col lg={2}>
            <div className="cell-label">Pool Supply</div>
            <div className="cell-data">{minTotalSupply}</div>
          </Col>
          <Col lg={3}>
            <div>
              <div className="cell-label">Reserves</div> 
              <div className="cell-data">{reserveTokenList}</div>
            </div>
          </Col>
          <Col lg={2}>
            <div className="cell-label">Reserve Ratio</div>
            <div className="cell-data">{reserveRatio}</div>          
          </Col>
        </Row>
        <Row className="selected-pool-meta-row">
          <Col lg={3}>
            <div className="cell-label">Your pool token holdings</div> 
            <div className="cell-data">{poolHoldings} {currentSelectedPool.symbol}</div> 
          </Col>
          <Col lg={4}>
            <div className="cell-label">Your reserve token holdings</div> 
            <div className="cell-data">{reserveTokenList}</div>
          </Col>
        </Row>
        <Row className="selected-pool-buy-sell-row">
          <Col lg={3}>
            <div>Fund Pool Holdings</div>
            <Form.Control type="number" placeholder="Enter amount to fund" onChange={this.onFundInputChanged}/>
            <div className="action-info-col">
            {fundInfo}
            <Button onClick={this.submitBuyPoolToken} className="pool-action-btn">Purchase</Button>
            </div>
          </Col>
          <Col lg={3}>
            <div>Liquitate Pool Holdings</div>
            <Form.Control type="number" placeholder="Enter amount to liquidate" onChange={this.onLiquidateInputChanged}/>
            <div className="action-info-col">
            {liquidateInfo}
            <Button onClick={this.submitSellPoolToken} className="pool-action-btn">Sell</Button>            
            </div>
          </Col>
          <Col lg={6}>
          <div className="volume-graph-container">
            <VolumeGraph/>
            </div>
          </Col>
        </Row>
      
        <Row>

        </Row>
        <Row>

        </Row>
      </div>
      
      )
  }
}

class VolumeGraph extends Component {
  render() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    if (currentNetwork !== '1') {
      return <div className="graph-message-text">Volume graph is available only on mainnet</div>
    }
    return (
      <div>
      <VictoryChart

>
  <VictoryLine
    style={{
      data: { stroke: "#c43a31" },
      parent: { border: "1px solid #ccc"}
    }}
    data={[
     ]}
      />
    </VictoryChart>
    <div className="h6 coming-soon-text">Volume and price graph. Coming Soon</div>
    </div>
      
      )
  }
}