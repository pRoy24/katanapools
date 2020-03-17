import {connect} from 'react-redux';
import ExploreTokens from './ExploreTokens';
import {setUserEnvironment} from '../../actions/user';
import {setFromPathListWithRates, setToPathListWithRates} from '../../actions/tokens';
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


    fetchTokenPathsWithRates: (fromToken, toToken, type, amount) => {

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
          console.log('***');
          metaData = metaData.filter(Boolean);
          console.log(metaData)
          if (type === 'from') {
         dispatch(setFromPathListWithRates(metaData));
          } else {
         dispatch(setToPathListWithRates(metaData));            
          }
        })
      })
      

      })
    }
      

  }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExploreTokens);