import React, {Component} from 'react';
import {Container, Row, Col, Form, Button} from 'react-bootstrap';
import AddressDisplay from '../../common/AddressDisplay';
import {toDecimals, fromDecimals} from '../../../utils/eth';
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
  
  
  onLiquidateInputChanged = (evt) => {
    this.setState({liquidateAmount: evt.target.value});
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
  
  render() {
    const {pool: {currentSelectedPool}} = this.props;
    const {reserve1Needed, reserve2Needed} = this.state;
    let minTotalSupply = parseFloat(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals)).toFixed(4);
    return (
      <div>
        <Row className="select-pool-row-1">
          <Col lg={1}>
            <img src={currentSelectedPool.imageURI} className="selected-pool-image"/>
          </Col>
          <Col lg={4}>
            <div>{currentSelectedPool.symbol}</div>
            <div>{currentSelectedPool.name}</div>
          </Col>
          <Col lg={2}>
           Address: <AddressDisplay address={currentSelectedPool.address}/>
          </Col>
          <Col lg={2}>
            Total Supply: {minTotalSupply}
          </Col>
          <Col lg={2}>
            <div>Reserves</div>
          </Col>
        </Row>
        <Row>
          
          <Col lg={4}>
            <div>Fund</div>
            <Form.Control type="number" placeholder="Enter amount you'd like to fund" onChange={this.onFundInputChanged}/>
            
            You will needs to stake
            {reserve1Needed} reserve 1
            {reserve2Needed} reserve 2
            <Button onClick={this.submitBuyPoolToken}>Purchase</Button>
            
          </Col>
          <Col lg={4}>
            <div>Sell</div>
            <Form.Control type="number" placeholder="Enter amount you'd like to liquidate" onChange={this.onLiquidateInputChanged}/>
          </Col>
        </Row>
        

        <Row>
          <Col lg={2}>
            {currentSelectedPool.reserves.length} reserves.
          </Col>
          <Col lg={2}>
            
          </Col>
          
        </Row>
        <Row>
          <div className="h4">
            24 Hour volume
          </div>
        </Row>
      </div>
      
      )
  }
}