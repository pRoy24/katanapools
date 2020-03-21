import {connect} from 'react-redux';
import TopNav from './TopNav';


const mapStateToProps = state => {
  return {
    user: state.user,
  }
}

export default connect(
    mapStateToProps,
    {}
)(TopNav);
