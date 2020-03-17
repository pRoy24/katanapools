import React, {Component} from 'react';
import { Row, Col, Button, Form} from 'react-bootstrap';
import './swapToken.scss';
import SwapTokenToolbar from './SwapTokenToolbar';
import SwapTokenWidget from './SwapTokenWidget';


var RegistryUtils = require('../../utils/RegistryUtils');

export default class SwapToken extends Component {
  constructor(props) {
    super(props);
    this.state = {smartTokenCheck: false, convertibleTokenCheck: true, transferAmount: 1,
            receiveAmount: 0, totalFee: 0, transactionFee: 0,
          tokenData: [],
    };
    
  }
  
  componentWillMount() {
    const {smartTokenCheck, convertibleTokenCheck} = this.state;
    this.props.getAllConvertibleTokens();
    this.props.getAllSmartTokens();
    
    this.fetchTokenList(smartTokenCheck, convertibleTokenCheck);
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {tokens: {convertibleTokens, smartTokens}} = this.props;
    const {smartTokenCheck, convertibleTokenCheck} = this.state;    
    if ((prevProps.tokens.convertibleTokens.length === 0 && convertibleTokens.length > 0) ||
    (prevProps.tokens.smartTokens.length === 0 && smartTokens.length > 0 )) {
      this.fetchTokenList(smartTokenCheck, convertibleTokenCheck);
    }
    
  }

  fetchTokenList = (smartTokenCheck, convertibleTokenCheck) => {
    const {tokens: {smartTokens, convertibleTokens}} = this.props;
    let tokenList = [];

    if (convertibleTokenCheck) {
      tokenList = tokenList.concat(convertibleTokens);
    }
    if (smartTokenCheck) {
      tokenList = tokenList.concat(smartTokens);
    }
    const initialFromToken = tokenList[0];
    const initialToToken = tokenList[1];
    this.setState({tokenData: tokenList, selectedTransferToken: initialFromToken, selectedReceiveToken: initialToToken });
    
  }
  
  refetchTokenList = (smartTokenCheck, convertibleTokenCheck) => {
    this.fetchTokenList(smartTokenCheck, convertibleTokenCheck);
  }
  render() {
    return (
      <div className="swap-token-app">
        <SwapTokenToolbar refetchTokenList={this.refetchTokenList}/>
        <SwapTokenWidget {...this.state} fetchTokenPathsWithRates={this.props.fetchTokenPathsWithRates}/>
      </div>
      )
  }
}