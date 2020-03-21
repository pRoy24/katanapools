import {connect} from 'react-redux';
import PoolTokens from './PoolTokens';

const mapStateToProps = state => {
  return {
     smartTokensWithReserves: state.tokens.smartTokensWithReserves,
     user: state.user,
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