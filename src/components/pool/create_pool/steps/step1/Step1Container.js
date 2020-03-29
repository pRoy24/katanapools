import Step1 from './Step1';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    user: state.user,
    isFetching: state.pool.isFetching,
    pool: state.pool,
    isCreationStepPending: state.pool.isCreationStepPending
  }
}

export default connect(
    mapStateToProps,
    {}
)(Step1);
