import {connect} from 'react-redux';
import SwapTokens from './SwapTokens';
import {Ethereum} from '../../utils/sdk/sdkUtils';
import  {getExpectedReturn, submitSwapToken,getNetworkPathMeta, getBalanceOfToken,
} from '../../utils/ConverterUtils';

const mapStateToProps = state => {
  return {
    web3: state.web3,

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
          console.log(metaData);
        })
      })
      
 
      })
    }
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SwapTokens);