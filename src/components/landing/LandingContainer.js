import {connect} from 'react-redux';
import Landing from './Landing';
import {setUserEnvironment, setProviderConnected} from '../../actions/user';
import {setConvertibleTokens, setSmartTokens, setConvertibleTokensBySmartTokensMap,
  setSmartTokensWithReserves
} from '../../actions/tokens';
import {getAllPathsWithRates} from '../../utils/PathUtils';
import {getConvertibleTokensInRegistry, getSmartTokensInRegistry,
getSmartTokensWithSymbolsInRegistry, getConvertibleTokensBySmartTokens} from '../../utils/ConverterUtils';
import {getTokenData} from '../../utils/RegistryUtils';

const mapStateToProps = state => {
  return {
    web3: state.web3,
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserEnvironment: () => {
      const web3 = window.web3;
      const args = {'selectedAddress': web3.currentProvider.selectedAddress, 'selectedNetwork': web3.currentProvider.networkVersion};
      dispatch(setUserEnvironment(args))
    },
    
    setMetaskConnected: () => {
      const payload = {'providerType': 'metamask'};
      dispatch(setProviderConnected(payload));
    },
    
    getAllConvertibleTokens: () => {
      getConvertibleTokensInRegistry().then(function(dataResponse){
        getTokenData(dataResponse).then(function(tokenDetailList){
          dispatch(setConvertibleTokens(tokenDetailList));
        })
      })
    },
    
    getAllSmartTokens: () => {
      getSmartTokensInRegistry().then(function(dataResponse){
        getTokenData(dataResponse).then(function(tokenDetailList){
          dispatch(setSmartTokens(tokenDetailList));
        })
      })      
    },
    
    getSmartTokensWithSymbols: () => {
      getSmartTokensWithSymbolsInRegistry().then(function(dataResponse){
      
        dispatch(setSmartTokensWithReserves(dataResponse));
      })
    },
    
    getConvertibleToSmartTokenMap: () => {
      getConvertibleTokensBySmartTokens().then(function(dataResponse){
        dispatch(setConvertibleTokensBySmartTokensMap(dataResponse));
      })
    }
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Landing);