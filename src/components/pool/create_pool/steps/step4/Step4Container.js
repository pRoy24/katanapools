import Step4 from './Step4';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    user: state.user,
    isCreationStepPending: state.pool.isCreationStepPending,
    pool: state.pool
  }
}

export default connect(
    mapStateToProps,
    {}
)(Step4);
