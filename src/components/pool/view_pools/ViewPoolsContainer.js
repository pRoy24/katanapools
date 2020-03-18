import ViewPools from './ViewPools';

import {connect} from 'react-redux';

import {setCurrentSelectedPool, setCurrentSelectedPoolError, setPoolHistory,
  setPoolTransactionStatus
} from '../../../actions/pool';
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
      dispatch(setCurrentSelectedPool({}));
      const web3 = window.web3;
      
      const senderAddress = web3.currentProvider.selectedAddress;

      RegistryUtils.getConverterRegistryAddress().then(function(converterContractRegistryAddress){
        const poolSmartTokenAddress = poolRow.address;
        RegistryUtils.getConverterAddressList(converterContractRegistryAddress, [poolSmartTokenAddress]).then(function(converters){
          RegistryUtils.getERC20DData(poolSmartTokenAddress).then(function(tokenData){
        
        const poolConverterAddress = converters[0];
  
        const BancorConverterContract = new web3.eth.Contract(BancorConverter, poolConverterAddress);
  
        const SmartTokenContract = new web3.eth.Contract(SmartToken, poolSmartTokenAddress);
  
        BancorConverterContract.methods.reserveTokenCount().call().then(function(numReserveTokens){
          
          let reserveTokenList = [];
          for (let a =0; a < numReserveTokens; a++) {
          const reserveTokenAddress = BancorConverterContract.methods.reserveTokens(a).call().then(function(resTokenAddress){
            return resTokenAddress;
          });
          reserveTokenList.push(reserveTokenAddress);
          }
          Promise.all(reserveTokenList).then(function(reserveTokenAddressList){
            let reserveTokenData = reserveTokenAddressList.map(function(reserveTokenAddress){
                  return  getReserveBalance(BancorConverterContract, reserveTokenAddress).then(function(reserveTokenBalance){
                    return getReserveRatio(BancorConverterContract, reserveTokenAddress).then(function(reserveRatio){
                     return RegistryUtils.getTokenLightDetails(reserveTokenAddress).then(function(tokenData){
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
                        let reserveData = Object.assign({}, tokenData, {reserveBalance: availableReserveBalance}, {reserveRatio: reserveRatio},
                        {userBalance: availableUserBalance});
                      
                        return reserveData;
                      })
                     })
                    });
                  })
          });
          RegistryUtils.getTokenDetails(poolSmartTokenAddress).then(function(smartTokenDetails){

            
          BancorConverterContract.methods.conversionFee().call().then(function(conversionFee){
            const conversinFeePercent = conversionFee / 10000;
               SmartTokenContract.methods.balanceOf(senderAddress).call().then(function(balanceData){
                   Promise.all(reserveTokenData).then(function(reserveDetail){
                      reserveDetail = reserveDetail.filter(Boolean);
                      const finalPayload = Object.assign({}, smartTokenDetails, {senderBalance: balanceData}, {converter: poolConverterAddress},
                      {reserves: reserveDetail}, {conversionFee: conversinFeePercent});
                      dispatch(setCurrentSelectedPool(finalPayload));
                   })
                    })
                  });
                });
          }).catch(function(err){
          dispatch(setCurrentSelectedPool({}));
        });
      });
    });
  
  });
  });

    },
    
    submitPoolBuy: (args) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
    
      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'waiting for user approval'}));
      let resNeededApproval = args.reservesNeeded.map(function(item){
        let reserveContract = {};
        if (item.symbol === 'ETH') {
          reserveContract = new web3.eth.Contract(EtherToken, item.address);
          const reserveAmount = item.neededMin;
          return reserveContract.methods.deposit().send({from: senderAddress, value: reserveAmount}).then(function(response){
            return response;
          })
        } else {
          reserveContract = new web3.eth.Contract(ERC20Token, item.address);
          const reserveAmount = item.neededMin;
          return getApproval(reserveContract, senderAddress,  args.converterAddress, reserveAmount).then(function(res){
            return res;
          })
        }
      });
      
      Promise.all(resNeededApproval).then(function(approvalResponse){
          ConverterContract.methods.fund(args.poolTokenProvided).send({
            from: senderAddress
          }, function(err, txHash){
            dispatch(setPoolTransactionStatus({type: 'pending', message: 'Funding pool with reserve tokens'}));
          }).then(function(fundRes){
            dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Funding pool with reserve tokens'}));
          })        
      })
      
 
    },
    
    submitPoolSell: (args) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
    
      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);

      ConverterContract.methods.liquidate(args.poolTokenSold).send({
        from: senderAddress
      }).then(function(sendResponse){
        console.log(sendResponse);
      })

    },
    
    fetchConversionVolume: (selectedPool) => {
      const  toCurrencyCode = selectedPool.symbol;
      let  fromCurrencyCode = '';
      if (selectedPool.reserves.length > 1) {
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

function getApproval(contract, owner, spender, amount) {

  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = toDecimals(allowance, amountDecimals);
    let diff = new BigNumber(minAllowance).minus(new BigNumber(minAmount));

    if (diff.isNegative()) {
    return contract.methods.approve(spender, minAmount).send({
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



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);