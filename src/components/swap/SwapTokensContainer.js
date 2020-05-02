import {connect} from 'react-redux';
import SwapTokens from './SwapTokens';
import {Ethereum} from '../../utils/sdk/sdkUtils';
import  {getExpectedReturn, submitSwapToken,getNetworkPathMeta, getBalanceOfToken,
} from '../../utils/ConverterUtils';
import {setFromPathListWithRates, setToPathListWithRates, resetFromPathList, resetToPathList, resetTokenPaths,
  getTokenPathsWithRate, getTokenPathsWithRateSuccess, getTokenPathsWithRateFailure,
  setFromPathListLoading, setToPathListLoading
} from '../../actions/tokens';
import {fetchTokens} from '../../actions/swap';

const mapStateToProps = state => {
  return {
    web3: state.web3,
    tokens: state.tokens,
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {


    fetchTokenPathsWithRates: (fromToken, toToken, type, amount) => {
      if (type === 'from') {
        dispatch(setFromPathListLoading());
      }
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


  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SwapTokens);