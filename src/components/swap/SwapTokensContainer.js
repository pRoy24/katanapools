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
    fetchTokenPathsWithRates: (fromToken, toToken, amount) => {
      let ethGraph = new Ethereum();
      ethGraph.init().then(function(initResponse){
        ethGraph.getAllPathsAndRates(fromToken.address, toToken.address, amount).then(function(fromPathWithPrice){
        let pathList = fromPathWithPrice[0];
        let pathPrices = fromPathWithPrice[1];
        let pathWithMeta = pathList.map(function(pathData, idx){
           return getNetworkPathMeta(pathData).then(function(pathMeta){
            return (Object.assign({}, {path: pathMeta}, {price: pathPrices[idx]}));

          }).catch(function(err){
            return null;
          })
        }, pathPrices);
        Promise.all(pathWithMeta).then(function(metaData){
          metaData = metaData.filter(Boolean);

        })
      })
      })
    },

    fetchTokenPathsWithRates: (fromToken, toToken, type, amount) => {
      if (type === 'from') {
        dispatch(setFromPathListLoading());
      } else {
        dispatch(setToPathListLoading());
      }
      dispatch(getTokenPathsWithRate(fromToken.address, toToken.address, type, amount)).then(function(response){
        if (response.payload.status  === 200) {
          if (type === 'from') {
            dispatch(setFromPathListWithRates(response.payload.data.data));
          } else {
            dispatch(setToPathListWithRates(response.payload.data.data));
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