import {connect} from 'react-redux';
import ExploreTokens from './ExploreTokens';
import {setUserEnvironment} from '../../actions/user';
import {setFromPathListWithRates, setToPathListWithRates, resetFromPathList, resetToPathList, resetTokenPaths} from '../../actions/tokens';
import {setPaths} from '../../actions/path';
import {fetchTokenPathsWithRates, createTokenMap} from '../../utils/ConverterUtils';
import {Ethereum} from '../../utils/sdk/sdkUtils';
import  {getExpectedReturn, submitSwapToken,getNetworkPathMeta, getBalanceOfToken,
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


    fetchTokenPathsWithRates: (fromToken, toToken, type, amount) => {
      dispatch(swapTokenStatus({}));
      if (type === 'from') {
        dispatch(resetFromPathList());
      }
      if (type === 'to') {
        dispatch(resetToPathList());
      }
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
          if (type === 'from') {
         dispatch(setFromPathListWithRates(metaData));
          } else {
         dispatch(setToPathListWithRates(metaData));
          }
        })
      })


      })
    },

    submitSwap: (networkPath, transferAmount, selectedTransferToken) => {
      let isEth = false;
      if (selectedTransferToken.symbol === 'ETH') {
        isEth = true;
      }
      const fromAmount = toDecimals(transferAmount, selectedTransferToken.decimals);
      getBalanceOfToken(selectedTransferToken.address, isEth).then(function(balanceResponse){
        const availableBalance = new Decimal(fromDecimals(balanceResponse,selectedTransferToken.decimals));
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