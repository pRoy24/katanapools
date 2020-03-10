import {connect} from 'react-redux';
import Landing from './Landing';
import {setUserEnvironment} from '../../actions/user';
import {setConvertibleTokens, setConvertibleTokensBySmartTokensMap} from '../../actions/tokens';
import {getAllPathsWithRates} from '../../utils/PathUtils';
import {getConvertibleTokensInRegistry, getConvertibleTokensBySmartTokens} from '../../utils/ConverterUtils';
import {getTokenData} from '../../utils/RegistryUtils';

const mapStateToProps = state => {
  return {
    web3: state.web3,

  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserEnvironment: () => {
      const web3 = window.web3;
      const args = {'selectedAddress': web3.currentProvider.selectedAddress, 'selectedNetwork': web3.currentProvider.networkVersion};
      dispatch(setUserEnvironment(args))
    },
    getAllConvertibleTokens: () => {
      getConvertibleTokensInRegistry().then(function(dataResponse){
        getTokenData(dataResponse).then(function(tokenDetailList){
          dispatch(setConvertibleTokens(tokenDetailList));
        })
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