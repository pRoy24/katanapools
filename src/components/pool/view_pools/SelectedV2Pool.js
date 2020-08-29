import React, {Component} from 'react';
import {ButtonGroup, Button, Form, Row, Col, InputGroup, FormControl} from 'react-bootstrap';

export default class SelectedV2Pool extends Component {
  constructor(props) {
    super(props);
    this.state = {'selectedTokenToAdd': '', 'amountTokenToAdd': '', 'selectedTokenToLiquidate': '', 'amountTokenToLiquidate': '' }
  }
  
  componentWillMount() {
    const {pool: {currentSelectedPool}} = this.props;
    console.log(currentSelectedPool);
    if (currentSelectedPool && currentSelectedPool.reserves.length > 0) {
    this.setState({
      selectedTokenToAdd: currentSelectedPool.reserves[0],
      selectedTokenToLiquidate: currentSelectedPool.reserves[0]
    })
    }
  }
  addPoolLiquidity = () => {
    const {selectedTokenToAdd, amountTokenToAdd, selectedTokenToLiquidate, amountTokenToLiquidate } = this.state;
    console.log(this.props);
    const {pool: {currentSelectedPool}} = this.props;
    
    const payload = {
      'address': selectedTokenToAdd.address,
      'decimals': selectedTokenToAdd.decimals,
      'amount': amountTokenToAdd,
      'converterAddress': currentSelectedPool.address
    };
    this.props.submitAddLiquidity(payload);
  }
  
  removePoolLiquidity = () => {
    
  }
  
  removeLiquidityTokenSelected = (item) => {
    this.setState({selectedTokenToLiquidate: item});
  }
  
  addLiquidityTokenSelected = (item) => {
    this.setState({selectedTokenToAdd: item});
  }
  
  
  addLiquidityAmountChanged = (evt) => {
    const amount = evt.target.value;
    this.setState({'amountTokenToAdd': amount});
  }
  
  removeLiquidityAmountChanged = (evt) => {
    const amount = evt.target.value;
    this.setState({'amountTokenToLiquidate': amount});
  }
  
  render() {
    const {pool: {currentSelectedPool}} = this.props;
    const {selectedTokenToAdd, selectedTokenToLiquidate, amountTokenToAdd, amountTokenToLiquidate} = this.state;
    const self = this;
    let reservesList = 
    <div>
    <ButtonGroup aria-label="Add Liquidity Token">{
    currentSelectedPool.reserves.map(function(item, idx){
    let btnIsActive = '';
    
    if (item.address === selectedTokenToAdd.address) {
      btnIsActive = 'active-select-btn';
    }

      return (<Button key={`add-liquidity-token-${idx}`} onClick={()=>self.addLiquidityTokenSelected(item)} className={`${btnIsActive}`}>
      {item.symbol}
      </Button>)
    })}
    </ButtonGroup>
    <InputGroup>
     <FormControl type="text" value={amountTokenToAdd}  onChange={this.addLiquidityAmountChanged}/>
      <InputGroup.Append>
        <InputGroup.Text id="btnGroupAddon2">{selectedTokenToAdd.symbol}</InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
    <Button onClick={this.addPoolLiquidity}>Add</Button>
    </div>;
    
    let removeLiquidityReserveList = 
    <div>
    <ButtonGroup aria-label="Remove liquidity token">{
    currentSelectedPool.reserves.map(function(item, idx){
    let btnIsActive = '';
    if (item.address === selectedTokenToLiquidate.address) {
      btnIsActive = 'active-select-btn';
    }
      return (<Button key={`remove-liquidity-token-${idx}`} onClick={()=>self.removeLiquidityTokenSelected(item)} className={`${btnIsActive}`}>
      {item.symbol}
      </Button>)
    })}
    </ButtonGroup>
    <InputGroup>
        <FormControl type="text" value={amountTokenToLiquidate} onChange={this.removeLiquidityAmountChanged}/>
        <InputGroup.Append>
        <InputGroup.Text id="btnGroupAddon2">{selectedTokenToLiquidate.symbol}</InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
    <Button>Remove</Button>
    </div>;
    
    return (
      <div>
      <Col lg={12}>
      <Row>
      <Col lg={6}>
      <div>
        Select Reserve to stake
        {reservesList}
      </div>
      </Col>
      <Col lg={6}>
        Remove Liquidity
         {removeLiquidityReserveList}
      </Col>
      </Row>
      </Col>
      </div>
      )
  }
}