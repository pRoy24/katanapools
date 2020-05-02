import {connect} from 'react-redux';
import Landing from './Landing';
import {setUserEnvironment, setProviderConnected} from '../../actions/user';
import {setConvertibleTokens, setSmartTokens, setConvertibleTokensBySmartTokensMap,
  setSmartTokensWithReserves,
} from '../../actions/tokens';
import {getAllPathsWithRates} from '../../utils/PathUtils';
import {getConvertibleTokensInRegistry, getSmartTokensInRegistry,
getSmartTokensWithSymbolsInRegistry, getConvertibleTokensBySmartTokens, multiCallTokenData} from '../../utils/ConverterUtils';
import {getConvertibleTokens, getConvertibleTokensSuccess, getConvertibleTokensFailure, getSmartTokens, getSmartTokensSuccess, getSmartTokensFailure } from '../../actions/app';
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
      dispatch(getConvertibleTokens()).then(function(dataResponse){
        if (dataResponse.payload.status === 200) {
          dispatch(getConvertibleTokensSuccess(dataResponse.payload.data));
        }
      }).catch(function(err){
        dispatch(getConvertibleTokensFailure(err));
      });

    },

    getAllSmartTokens: () => {
      dispatch(getSmartTokens()).then(function(response){
        if (response.payload.status === 200) {
          dispatch(getSmartTokensSuccess(response.payload.data));
        }
      }).catch(function(err){
        dispatch(getSmartTokensFailure(err));
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