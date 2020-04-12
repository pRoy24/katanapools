import React, {Component} from 'react';
import {Form, Button, Container, Row, Col, Alert, InputGroup, ButtonGroup,
        ListGroup, ListGroupItem, Tooltip, OverlayTrigger} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faPlus, faSpinner, faTimes, faQuestionCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default class Step2 extends Component {

  constructor() {
    super();
    this.state = {tokenAmount: '', connectorAmount: '', detailsVisible: false};
  }
  tokenAmountChanged = (evt) => {
    this.setState({tokenAmount: evt.target.value});
  }

  connectorAmountChanged = (evt) => {
    this.setState({connectorAmount: evt.target.value});
  }

  onSubmit = (evt) => {
    evt.preventDefault();
    const {tokenAddressList, numPoolTokens} = this.state;
    const {pool: {converterContract}} = this.props;

    const converterContractAddress = converterContract._address;

    this.props.fundRelayWithSupply({'tokenAddressList': tokenAddressList, initialSupply: numPoolTokens, converterAddress: converterContractAddress});
  }

  componentWillMount(){
    const { pool: {tokenList}} = this.props;
    const currentAddressList = tokenList;
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
  
  setAllowanceForPool = () => {
      
  }
  
  toggleDetailsBox = () => {
    this.setState({detailsVisible: !this.state.detailsVisible});
  }
  
  render() {
    const {tokenAddressList, numPoolTokens, detailsVisible} = this.state;
    const {isCreationStepPending} = this.props;

    const self = this;
    let hasEth = false;
    let tokenAmountDisplay = tokenAddressList.map(function(item, key){
      if (item.symbol === 'ETH') {
        hasEth = true;
      }
       return <TokenAmountRow key={`amount-row-${key}`} item={item} idx={key} setTokenAmount={self.setTokenAmount}/>
    });


function renderFundingTooltipDisplay(props) {
  return <Tooltip {...props}>
      <div>To prevent initial arbitrage upon pool deploy,
      the initial value of funding should roughly match the ratio of reserves in the pool.</div>
      <div>For instance if you are creating a pool with ETH, DAI and BNT in 30/30/30 ratio</div>
      <div>The ratio of pool tokens in this case is 1:1:1 and hence the USD values of initial fuding</div>
      <div>should also roughly be the same.</div>
    </Tooltip>;
}


    let transactionDetails = <span/>;
    let numTokenTransactions = tokenAddressList.length * 2;
    let numTransactions = numTokenTransactions + 1;
    if (hasEth) {
      numTransactions ++;
    }
    if (detailsVisible) {
      transactionDetails = (
        <div>
          <div>1 transction to create initial pool supply.</div>
          <div>{numTokenTransactions} transactions for approving and transferring initial tokens to the converter.</div>
          {hasEth ? <div> 1 Transaction to deposit Ether into Ether token </div> : <span/>}
        </div>
        )
    }

    return (
        <div className="create-pool-form-container">
        <Container>
            <div className={"header left-align-text no-pad-left margin-bottom-10"}>
            Create initial funding for the pool.
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderFundingTooltipDisplay}>
              <FontAwesomeIcon icon={faQuestionCircle} className="info-tooltip-btn"/>
            </OverlayTrigger>
          </div>
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

        <Row>
          <Col lg={4} className="left-align-text">
          <Button variant="primary" type="submit" className="pool-wizard-submit-btn" disabled={isCreationStepPending}>
            Next
          </Button>
          </Col>
          <Col lg={8}>
          <div className="sub-text">
            <div className="subtext-label">On clicking next you will be required to perform {numTransactions} transactions.</div>
            <div onClick={this.toggleDetailsBox} className="details-bar">Details <FontAwesomeIcon icon={faChevronDown}/></div>
            <div>
              {transactionDetails}
            </div>
          </div>
          </Col>
        </Row>
        </Form>
      </Container>
      </div>
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