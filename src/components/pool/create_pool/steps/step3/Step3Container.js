import Step3 from './Step3';
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
)(Step3);
