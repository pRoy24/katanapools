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
      const addLiquidityAmount = toDecimals(payload.amount, payload.decimals);

      const tokenDecimals = payload.decimals;

      const converterAddress = payload.converterAddress;
      const reserveAddress = payload.address;
      const web3 = window.web3;
      const walletAddress = web3.currentProvider.selectedAddress;
      const tokenAddress = payload.address;

      
      const ConverterContract = new web3.eth.Contract(BancorV2Converter, converterAddress);
      console.log(converterAddress);
      console.log(ConverterContract);
      console.log(reserveAddress);
      console.log(addLiquidityAmount);
      console.log(walletAddress);
      console.log('***');
      setTokenAllowance(tokenAddress, converterAddress, tokenDecimals, addLiquidityAmount).then(function(allowanceResponse){
        
        
        
        ConverterContract.methods.addLiquidity(reserveAddress, addLiquidityAmount , 1).send({
          from: walletAddress
          }).then(function(response){
            console.log(response);
          })
      })

    }
  }
}  

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SelectedV2Pool);