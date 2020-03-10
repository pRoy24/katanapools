import {connect} from 'react-redux';
import ExploreTokens from './ExploreTokens';
import {setUserEnvironment} from '../../actions/user';
import {setPathListWithRates} from '../../actions/tokens';
import {setPaths} from '../../actions/path';
import {fetchTokenPathsWithRates, createTokenMap} from '../../utils/ConverterUtils';
import {Ethereum} from '../../utils/sdk/sdkUtils';
import  {getExpectedReturn, submitSwapToken,getNetworkPathMeta, getBalanceOfToken,
} from '../../utils/ConverterUtils';

const mapStateToProps = state => {
  return {
    web3: state.web3,
    tokens: state.tokens,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    fetchTokenPathsWithRates: (fromToken, toToken, convertibleTokensBySmartTokens) => {
      let ethGraph = new Ethereum();
      ethGraph.init().then(function(initResponse){
        ethGraph.getAllPathsAndRates(fromToken.address, toToken.address, 1).then(function(fromPathWithPrice){
        ethGraph.getAllPathsAndRates(toToken.address, fromToken.address, 1).then(function(toPathWithPrice){
          
        let pathList = fromPathWithPrice[0].concat(toPathWithPrice[0]);
        let pathPrices = fromPathWithPrice[1].concat(toPathWithPrice[1]);
        let pathWithMeta = pathList.map(function(pathData, idx){

           return getNetworkPathMeta(pathData).then(function(pathMeta){

            return (Object.assign({}, {path: pathMeta}, {price: pathPrices[idx]}));
            
          }).catch(function(err){
            return null;
          })
        }, pathPrices);
        Promise.all(pathWithMeta).then(function(metaData){

          metaData = metaData.filter(Boolean);
         dispatch(setPathListWithRates(metaData));
        })
      })
      
        });
      })
    }
      

  }
}

function getAllPaths(paths, tentativePathList, smartTokenMap, tokenList) {
  if (smartTokenMap) {
    
    
    
  } else {
    getAllPaths();
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExploreTokens);