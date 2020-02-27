import ViewPools from './ViewPools';

import {connect} from 'react-redux';

import {toDecimals, fromDecimals} from '../../../utils/eth';
import {getTokenDetails} from '../../../utils/RegistryUtils';
import {setCurrentSelectedPool} from '../../../actions/pool';

const SmartToken = require('../../../contracts/SmartToken.json');
const SmartTokenByteCode = require('../../../contracts/SmartTokenByteCode.js');
const RegistryUtils = require('../../../utils/RegistryUtils');
const BancorConverter = require('../../../contracts/BancorConverter.json');
const BancorConverterByteCode = require('../../../contracts/BancorConverterByteCode.js');
const ContractRegistry = require('../../../contracts/ContractRegistry.json');
const BNT_TOKEN_ID = process.env.REACT_APP_BNT_ID;
const ERC20Token = require('../../../contracts/ERC20Token.json');

const mapStateToProps = state => {
  return {
    pool: state.pool,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    
    getPoolDetails: (poolRow) => {

      const web3 = window.web3;
      
      const poolSmartTokenAddress = poolRow.address;
      const poolConverterAddress = poolRow.convertibles[0];
      
      const BancorConverterContract = new web3.eth.Contract(BancorConverter, poolConverterAddress);
      
      const SmartTokenContract = new web3.eth.Contract(SmartToken, poolSmartTokenAddress);

      BancorConverterContract.methods.reserveTokenCount().call().then(function(numReserveTokens){
      
      let reserveTokenList = [];
      
      for (let a = 0; a < numReserveTokens; a++){
  
        let reserveTokenDetail = BancorConverterContract.methods.reserveTokens(a).call().then(function(reserveTokenAddress){
          
        return   BancorConverterContract.methods.getReserveBalance(reserveTokenAddress).call().then(function(reserveTokenBalance){
          
        
         return getTokenDetails(reserveTokenAddress).then(function(tokenData){
            return Object.assign({}, tokenData, {reserveBalance: reserveTokenBalance});
          })
        }) ;
        });
        
        reserveTokenList.push(reserveTokenDetail);
      }
    
    
    getTokenDetails(poolSmartTokenAddress).then(function(smartTokenDetails){

    Promise.all(reserveTokenList).then(function(reserveTokenDetails){
      let finalPayload = Object.assign({}, smartTokenDetails, {converter: poolConverterAddress}, {reserves: reserveTokenDetails});
      dispatch(setCurrentSelectedPool(finalPayload));
    })
    
    })

      
      });
      
    },
    
    getPoolFundingDetails:(amount) => {
      
    }
    

    

  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);