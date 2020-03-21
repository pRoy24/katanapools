import Step4 from './Step4';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    user: state.user,
    isFetching: state.pool.isFetching,
    pool: state.pool
  }
}

export default connect(
    mapStateToProps,
    {}
)(Step4);
