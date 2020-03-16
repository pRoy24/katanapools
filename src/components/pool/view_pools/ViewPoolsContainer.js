import ViewPools from './ViewPools';

import {connect} from 'react-redux';

import {setCurrentSelectedPool, setCurrentSelectedPoolError, setPoolHistory} from '../../../actions/pool';
import {getConvertibleTokensBySmartTokens, getBalanceOfToken} from '../../../utils/ConverterUtils';
import axios from 'axios';
import  {toDecimals, fromDecimals} from '../../../utils/eth';
import moment from 'moment'
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
      const poolConverterAddress = poolRow.converter;

      const BancorConverterContract = new web3.eth.Contract(BancorConverter, poolConverterAddress);

      const SmartTokenContract = new web3.eth.Contract(SmartToken, poolSmartTokenAddress);

      BancorConverterContract.methods.connectorTokenCount().call().then(function(numReserveTokens){

      let reserveTokenList =
     poolRow.reserves.map(function(item){
       let reserveTokenAddress = item.address;
        return  getReserveBalance(BancorConverterContract, reserveTokenAddress).then(function(reserveTokenBalance){
          return getReserveRatio(BancorConverterContract, reserveTokenAddress).then(function(reserveRatio){
           return RegistryUtils.getTokenDetails(reserveTokenAddress).then(function(tokenData){
             if (tokenData === null || tokenData === undefined) {
               return null;
             }
             let isEth = false;
             if (tokenData && tokenData.symbol === 'ETH') {
               isEth = true;
             }
             return  getBalanceOfToken(reserveTokenAddress, isEth).then(function(balanceResponse){
              const availableReserveBalance = fromDecimals(reserveTokenBalance, tokenData.decimals);
              const availableUserBalance = fromDecimals(balanceResponse, tokenData.decimals);
              return Object.assign({}, tokenData, {reserveBalance: availableReserveBalance}, {reserveRatio: reserveRatio},
              {userBalance: availableUserBalance});
            })
           })
          });
        }) ;
     })

    RegistryUtils.getTokenDetails(poolSmartTokenAddress).then(function(smartTokenDetails){

     SmartTokenContract.methods.balanceOf(senderAddress).call().then(function(balanceData){

      Promise.all(reserveTokenList).then(function(reserveTokenDetails){
        reserveTokenDetails = reserveTokenDetails.filter(Boolean);
        let finalPayload = Object.assign({}, smartTokenDetails,{senderBalance: balanceData}, {converter: poolConverterAddress}, {reserves: reserveTokenDetails});
        dispatch(setCurrentSelectedPool(finalPayload));
      })
      })
      })
      }).catch(function(err){
        dispatch(setCurrentSelectedPoolError(err.toString()));
      });
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
    },
    
    fetchConversionVolume: (selectedPool) => {
      const  toCurrencyCode = selectedPool.symbol;
      let  fromCurrencyCode = '';
      if (selectedPool.reserves.length >= 1) {
       fromCurrencyCode = selectedPool.reserves[1].symbol;
      } else if (selectedPool.reserves.length === 1) {
        fromCurrencyCode = selectedPool.reserves[0].symbol;
      }

      
      const conversionVolumeURL = `https://api.bancor.network/0.1/currencies/volumeHistory?toCurrencyCode=${toCurrencyCode}&fromCurrencyCode=${fromCurrencyCode}&timeFrame=year`;

      axios.get(conversionVolumeURL).then(function(dataResponse){
        if (dataResponse.data && dataResponse.data.data) {
          const graphResponse = dataResponse.data.data.data;
          let graphReturnData = graphResponse.slice(graphResponse.length - 30, graphResponse.length - 1).map(function(item){
            return Object.assign({}, {timeStamp: item.timeStamp}, {data: item.volume.eth});
          });
          dispatch(setPoolHistory(graphReturnData));
          
        } else {
          return [];
        }
        
      })
    }
  }
}


function getReserveBalance(BancorConverterContract, reserveTokenAddress) {
  return  BancorConverterContract.methods.getReserveBalance(reserveTokenAddress).call().then(function(reserveTokenBalance){
    return reserveTokenBalance;
  }).catch(function(err){
    return 0;
  });
}

function getReserveRatio(BancorConverterContract, reserveTokenAddress) {
  return  BancorConverterContract.methods.getReserveRatio(reserveTokenAddress).call().then(function(reserveTokenBalance){
    return reserveTokenBalance;
  }).catch(function(err){
    return '-';
  });  
}

function getApproval(contract, owner, spender, amount, isEth) {
  if (isEth) {
     return contract.methods.decimals().call().then(function(amountDecimals){
       let minAmount = toDecimals(amount, amountDecimals);
    return contract.methods.deposit().send({
      from: owner
    }).then(function(depositResponse){
      return depositResponse;
    })

    
    });
  } else {
  return contract.methods.decimals().call().then(function(amountDecimals){
    

  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }

    let minAmount = toDecimals(amount, amountDecimals);
    let minAllowance = toDecimals(allowance, amountDecimals);

    let diff = new BigNumber(minAllowance).minus(new BigNumber(minAmount));

    if (diff.isNegative()) {
    return contract.methods.approve(spender, minAllowance).send({
      from: owner
    }).then(function(allowanceResponse){
      return allowanceResponse;
    })
    } else {
      return null;
    }
  });
  });
  }
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);