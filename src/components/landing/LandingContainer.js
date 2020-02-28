import { drizzleConnect } from 'drizzle-react'
import Landing from './Landing';

const mapStateToProps = state => {
  return {
    drizzleStatus: state.drizzleStatus,
    web3: state.web3,
    drizzle: state.drizzle
  }
}

export default drizzleConnect(Landing, mapStateToProps);