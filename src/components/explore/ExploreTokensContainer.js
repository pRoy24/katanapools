import {connect} from 'react-redux';
import ExploreTokens from './ExploreTokens';
import {setUserEnvironment} from '../../actions/user';
import {setFromPathListWithRates, setToPathListWithRates, resetFromPathList, resetToPathList, resetTokenPaths,
  getTokenPathsWithRate, getTokenPathsWithRateSuccess, getTokenPathsWithRateFailure
} from '../../actions/tokens';
import {setPaths} from '../../actions/path';
import {fetchTokenPathsWithRates, createTokenMap} from '../../utils/ConverterUtils';

import  {getExpectedReturn, submitSwapToken,getNetworkPathMeta, getBalanceOfToken,getDecimalsOfToken,
} from '../../utils/ConverterUtils';
import {swapTokenStatus} from '../../actions/swap';
import {toDecimals, fromDecimals} from '../../utils/eth';
import {Decimal} from 'decimal.js';

const mapStateToProps = state => {
  return {
    web3: state.web3,
    tokens: state.tokens,
    user: state.user,
    swap: state.swap,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    setProviderNotification: () => {
      dispatch(swapTokenStatus({type: 'error', 'message': `Please connect a web3 wallet provider to make transactions`}));
    },
    
    fetchTokenPathsWithRates: (fromToken, toToken, type, amount) => {
      console.log(fromToken);
      console.log(toToken);
      console.log(type);
      console.log(amount);
      console.log("****");
      dispatch(getTokenPathsWithRate(fromToken.address, toToken.address, type, amount)).then(function(response){
        if (response.payload.status  === 200) {
          if (type === 'from') {
            dispatch(setFromPathListWithRates(response.payload.data));
          } else {
            dispatch(setToPathListWithRates(response.payload.data));
          }
        }
      }).catch(function(err){
        dispatch(getTokenPathsWithRateFailure(err));
      })

    },

    submitSwap: (networkPath, transferAmount, selectedTransferToken) => {
      let isEth = false;
      if (selectedTransferToken.symbol === 'ETH') {
        isEth = true;
      }
      getDecimalsOfToken(selectedTransferToken.address).then(function(tokenDecimals){

      const fromAmount = toDecimals(transferAmount, tokenDecimals);
      getBalanceOfToken(selectedTransferToken.address, isEth).then(function(balanceResponse){
        const availableBalance = new Decimal(fromDecimals(balanceResponse,tokenDecimals));
        const requiredBalance = new Decimal(transferAmount)
        if (requiredBalance.lessThanOrEqualTo(availableBalance)) {

          submitSwapToken(networkPath, fromAmount, selectedTransferToken.address, isEth).then(function(response){

          }).catch(function(err){
            if (err.message) {

            }
          })
        } else {
          dispatch(swapTokenStatus({type: 'error', 'message': `Not enough balance for ${selectedTransferToken.symbol}`}));
        }
      });

      })
      },
  resetTokenPathsWithRates: () => {
    dispatch(resetTokenPaths());
  }

  }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExploreTokens);