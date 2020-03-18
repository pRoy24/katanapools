import {connect} from 'react-redux';
import PoolTokens from './PoolTokens';

const mapStateToProps = state => {
  return {
     smartTokensWithReserves: state.tokens.smartTokensWithReserves,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PoolTokens);