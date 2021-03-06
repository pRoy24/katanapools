import SelectedV2Pool from './SelectedV2Pool';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {connect} from 'react-redux';
import {setTokenAllowance} from '../../../utils/ConverterUtils';
const BancorV2Converter = require('../../../contracts/LiquidityPoolV2Converter.json');

const mapStateToProps = state => {
  return {
    pool: state.pool,
    user: state.user,
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    submitAddLiquidity: (payload) => {
      const tokenDecimals = payload.decimals ? parseInt(payload.decimals, 10) : 18;
      const addLiquidityAmount = toDecimals(payload.amount, tokenDecimals);
      const converterAddress = payload.converterAddress;
      const reserveAddress = payload.address;
      const web3 = window.web3;
      const walletAddress = web3.currentProvider.selectedAddress;
      const tokenAddress = payload.address;
      const ConverterContract = new web3.eth.Contract(BancorV2Converter, converterAddress);
      setTokenAllowance(tokenAddress, converterAddress, tokenDecimals, addLiquidityAmount).then(function(allowanceResponse){
        ConverterContract.methods.addLiquidity(reserveAddress, addLiquidityAmount, 1).send({
            from: walletAddress,
            value: 0
        }).then(function(response){
            console.log(response);
          }).catch(function(err){
            console.log(err);
          })
       })
    },
    
    submitRemoveLiquidity: (payload) => {

      const tokenDecimals = payload.decimals ? parseInt(payload.decimals, 10) : 18;
      const removeLiquidityAmount = toDecimals(payload.amount, tokenDecimals);
      const converterAddress = payload.converterAddress;
      const reserveAddress = payload.address;
      const web3 = window.web3;
      const walletAddress = web3.currentProvider.selectedAddress;
      const tokenAddress = payload.address;
      const ConverterContract = new web3.eth.Contract(BancorV2Converter, converterAddress);
    
      
      setTokenAllowance(tokenAddress, converterAddress, tokenDecimals, removeLiquidityAmount).then(function(allowanceResponse){
        ConverterContract.methods.removeLiquidity(reserveAddress, removeLiquidityAmount, 1).send({
            from: walletAddress,
            value: 0
        }).then(function(response){
            console.log(response);
          }).catch(function(err){
            console.log(err);
          })
       })
       
    }
  }
}  

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SelectedV2Pool);