import {connect} from 'react-redux';
import Landing from './Landing';
import {setUserEnvironment} from '../../actions/user';

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
    }
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Landing);