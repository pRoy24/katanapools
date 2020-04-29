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

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {tokens: {convertibleTokens, smartTokens}} = this.props;
    const {smartTokenCheck, convertibleTokenCheck} = this.state;
  }

  render() {
    const {user: {providerConnected}, tokens: {convertibleTokens, fromPathListWithRate, fromPathLoading}} = this.props;
    return (
      <div className="swap-token-app">
        <SwapTokenWidget {...this.state} tokenData={convertibleTokens}
        fetchTokenPathsWithRates={this.props.fetchTokenPathsWithRates}
        fromPathListWithRate={fromPathListWithRate} fromPathLoading={fromPathLoading}/>
      </div>
      )
  }
}