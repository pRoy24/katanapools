import React, {Component} from 'react';
import './swapToken.scss';
import SwapTokenWidget from './SwapTokenWidget';

export default class SwapToken extends Component {
  constructor(props) {
    super(props);
    this.state = {smartTokenCheck: false, convertibleTokenCheck: true, transferAmount: 1,
            receiveAmount: 0, totalFee: 0, transactionFee: 0,
          tokenData: [],
    };
  }

  componentWillMount() {
    this.props.getAllConvertibleTokens();
    this.props.getAllSmartTokens();

  }

  render() {
    const { tokens: {convertibleTokens, fromPathListWithRate, fromPathLoading}} = this.props;
    return (
      <div className="swap-token-app">
        <SwapTokenWidget {...this.state} tokenData={convertibleTokens}
        fetchTokenPathsWithRates={this.props.fetchTokenPathsWithRates}
        fromPathListWithRate={fromPathListWithRate} fromPathLoading={fromPathLoading}/>
      </div>
      )
  }
}