import ViewPools from './ViewPools';

import {connect} from 'react-redux';

import {setCurrentSelectedPool, setCurrentSelectedPoolError} from '../../../actions/pool';

const SmartToken = require('../../../contracts/SmartToken.json');

const BancorConverter = require('../../../contracts/BancorConverter.json');

const ERC20Token = require('../../../contracts/ERC20Token.json');
const EtherToken = require('../../../contracts/EtherToken.json');

const BigNumber = require('bignumber.js');

var RegistryUtils =require('../../../utils/RegistryUtils');

const mapStateToProps = state => {
  return {
    pool: state.pool,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    
    getPoolDetails: (poolRow) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      const poolSmartTokenAddress = poolRow.address;
      const poolConverterAddress = poolRow.convertibles[0];

      const BancorConverterContract = new web3.eth.Contract(BancorConverter, poolConverterAddress);

      const SmartTokenContract = new web3.eth.Contract(SmartToken, poolSmartTokenAddress);

      BancorConverterContract.methods.reserveTokenCount().call().then(function(numReserveTokens){

      let reserveTokenList = [];
      
      for (let a = 0; a < numReserveTokens; a++){
  
        let reserveTokenDetail = BancorConverterContract.methods.reserveTokens(a).call().then(function(reserveTokenAddress){
          
        return  BancorConverterContract.methods.getReserveBalance(reserveTokenAddress).call().then(function(reserveTokenBalance){
          return BancorConverterContract.methods.getReserveRatio(reserveTokenAddress).call().then(function(reserveRatio){
           return RegistryUtils.getTokenDetails(reserveTokenAddress).then(function(tokenData){
              return Object.assign({}, tokenData, {reserveBalance: reserveTokenBalance}, {reserveRatio: reserveRatio});
            })
          });
        }) ;
        });
        
        reserveTokenList.push(reserveTokenDetail);
      }
    
    
    RegistryUtils.getTokenDetails(poolSmartTokenAddress).then(function(smartTokenDetails){

     SmartTokenContract.methods.balanceOf(senderAddress).call().then(function(balanceData){

      Promise.all(reserveTokenList).then(function(reserveTokenDetails){
        
        let finalPayload = Object.assign({}, smartTokenDetails,{senderBalance: balanceData}, {converter: poolConverterAddress}, {reserves: reserveTokenDetails});
        dispatch(setCurrentSelectedPool(finalPayload));
      })
    
    })
   })
      
      }).catch(function(err){

        dispatch(setCurrentSelectedPoolError(err.toString()));
      });
    },
    
    getPoolFundingDetails:(amount) => {
      
    },
    
    submitPoolBuy: (args) => {

      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
    
      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);

      let reserve1Contract = null;
      let reserve2Contract = null;
      if (!args.reserve1.isEth) {
        reserve1Contract = new web3.eth.Contract(ERC20Token, args.reserve1.address);
      } else {
        reserve1Contract = new web3.eth.Contract(EtherToken, args.reserve2.address);
      }
      
      if (!args.reserve2.isEth) {
        reserve2Contract = new web3.eth.Contract(ERC20Token, args.reserve2.address);
      } else {
        reserve2Contract = new web3.eth.Contract(EtherToken, args.reserve2.address);
      }
      

      getApproval(reserve1Contract, senderAddress,  args.converterAddress, args.reserve1.amount, args.reserve1.isEth).then(function(res){
        getApproval(reserve2Contract, senderAddress, args.converterAddress, args.reserve2.amount, args.reserve2.isEth).then(function(res2){
          ConverterContract.methods.fund(args.poolTokenNeeded).send({
            from: senderAddress
          }).then(function(fundRes){
            console.log(fundRes);
          })
        })
      })
    },
    
    submitPoolSell: (args) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
    
      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      const PoolTokenContract = new web3.eth.Contract(SmartToken, args.poolAddress);
      getApproval(PoolTokenContract, senderAddress,  args.converterAddress, args.poolTokenSold, false).then(function(res){
        
      ConverterContract.methods.liquidate(args.poolTokenSold).send({
        from: senderAddress
      }).then(function(sendResponse){
        console.log(sendResponse);
      })
      });
    }
  }
}


function getApproval(contract, owner, spender, amount, isEth) {
  if (isEth) {
    return new Promise((resolve)=>(resolve()));
  } else {
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let diff = new BigNumber(allowance).minus(new BigNumber(amount));
    if (diff.isNegative()) {
    return contract.methods.approve(spender, allowance).send({
      from: owner
    }).then(function(allowanceResponse){
      return allowanceResponse;
    })
    } else {
      return null;
    }
  });
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);