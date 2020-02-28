import React, {Component} from 'react';
import {Container, Row, Col, Form, Button} from 'react-bootstrap';
import AddressDisplay from '../../common/AddressDisplay';
import {toDecimals, fromDecimals} from '../../../utils/eth';
const BigNumber = require('bignumber.js');

export default class SelectedPool extends Component {
  constructor(props) {
    super(props);
    this.state= {fundAmount: 0, liquidateAmount: 0}
  }
  onFundInputChanged = (evt) => {
    let inputFund = evt.target.value;
    this.calculateAmount(inputFund);
    this.setState({fundAmount: inputFund});
  }
  
  calculateAmount = (inputFund) => {
    const {pool: {currentSelectedPool}} = this.props;

    const minTotalSupply = new BigNumber(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals));

    let maxInputFund = new BigNumber(toDecimals(inputFund, currentSelectedPool.decimals));

    let fundAfterAdd = maxInputFund.dividedBy((minTotalSupply).plus(maxInputFund)).multipliedBy(new BigNumber(100));
    
    console.log(maxInputFund.toString());
    console.log(fundAfterAdd.toString());
    
     console.log(fundAfterAdd.toString());


  }
  
  
  onLiquidateInputChanged = (evt) => {
    this.setState({liquidateAmount: evt.target.value});
  }
  
  render() {
    const {pool: {currentSelectedPool}} = this.props;
    let minTotalSupply = parseFloat(fromDecimals(currentSelectedPool.totalSupply, currentSelectedPool.decimals)).toFixed(4);
    return (
      <div>
        <Row>
          <Col lg={2}>
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
            
            <Button>Buy</Button>
            
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