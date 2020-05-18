import ViewPools from './ViewPools';

import {connect} from 'react-redux';

import {setCurrentSelectedPool, setCurrentSelectedPoolError, setPoolHistory,
  setPoolTransactionStatus, resetPoolHistory, getPoolDetails, getPoolDetailsSuccess, getPoolDetailsFailure,
  getPoolApproval, getPoolApprovalSuccess, getPoolRevocation, getPoolRevocationSuccess,
} from '../../../actions/pool';
import {getConvertibleTokensBySmartTokens, getBalanceOfToken, getAllowanceOfToken, setTokenAllowance, revokeTokenAllowance, submitSwapToken} from '../../../utils/ConverterUtils';
import {isEmptyString} from '../../../utils/ObjectUtils';
import axios from 'axios';
import  {toDecimals, fromDecimals} from '../../../utils/eth';
import moment from 'moment'
const SmartToken = require('../../../contracts/SmartToken.json');

const BancorConverter = require('../../../contracts/BancorConverter.json');

const ERC20Token = require('../../../contracts/ERC20Token.json');
const EtherToken = require('../../../contracts/EtherToken.json');

const BigNumber = require('bignumber.js');
const Decimal = require('decimal.js');


var RegistryUtils =require('../../../utils/RegistryUtils');

const mapStateToProps = state => {
  return {
    pool: state.pool,
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    getPoolDetails: (poolRow) => {
      dispatch(setCurrentSelectedPool({}));
      dispatch(getPoolDetails(poolRow.address)).then(function(response){
         if (response.payload.status === 200) {
           dispatch(getPoolDetailsSuccess(response.payload.data));
         } else {
           dispatch(getPoolDetailsFailure(response.payload.error));
         }
       })
    },


    fetchUserPoolDetails: (poolRow) => {
      getUserPoolHoldings(poolRow).then(function(updatePoolRowResponse){
        dispatch(setCurrentSelectedPool(updatePoolRowResponse))
      })
    },

    submitPoolBuy: (args) => {
      createBuyWithArguments(args, dispatch);
    },

    submitPoolBuyWithSingleReserve: (payload) => {
      const swapArgs = payload.swap;
      const baseToken = swapArgs.find(function(item){
        return item.path === null;
      })

      let tokenTransferMapping = swapArgs.map(function(item, idx){
        
        if (item.path !== null) {
          let isEth = false;
          if (baseToken.token.symbol === 'ETH') {
            isEth = true;
          }
          return submitSwapToken(item.path, item.totalAmount, baseToken.token.address, isEth).then(function(res){
            return res;
          })
        } else {
          return new Promise((resolve, reject) => (resolve()));
        }
      });

      Promise.all(tokenTransferMapping).then(function(transferResponse){
        createBuyWithArguments(payload.fund, dispatch);
        // Call buy with args
      });

    },

    resetPoolHistory: () => {
      dispatch(resetPoolHistory());
    },

    submitPoolSellWithSingleReserve: (payload) => {
      createSellWithArguments(payload.funding, dispatch).then(function(sellResponse){
      const args = payload.paths;
      const baseToken = args.find(function(item){
        return item.path === null;
      })

      let tokenTransferMapping = args.map(function(item, idx){
        if (item.path !== null) {
          let isEth = false;
          if (item.token.symbol === 'ETH') {
            isEth = true;
          }
          return submitSwapToken(item.path, item.conversionAmount, item.token.address, isEth).then(function(res){
            return res;
          })
        } else {
          return new Promise((resolve, reject) => (resolve()));
        }
      });
      })
    },
    
    submitPoolSell: (args) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;

      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval'}));

      ConverterContract.methods.liquidate(args.poolTokenSold).send({
        from: senderAddress
      }, function(err, txHash){
        dispatch(setPoolTransactionStatus({type: 'pending', message: 'Liquidating pool tokens into reserve tokens.'}));
      }).then(function(sendResponse){

        let withdrawEth = args.reservesAdded.map(function(reserve){
          if (reserve.symbol === 'ETH') {
            // withdraw from ether token to wallet
            const reserveContract = new web3.eth.Contract(EtherToken, reserve.address);
           return reserveContract.methods.withdraw(reserve.addedMin).send({from: senderAddress}, function(err, txHash){
                   dispatch(setPoolTransactionStatus({type: 'pending', message: 'Withdrawing Ether from contract.'}));
           }).then(function(response){
              return response;
            });
          } else {
            return null;
          }
        }).filter(Boolean);
        if (withdrawEth) {
          Promise.all(withdrawEth).then(function(withdrawEthResponse){
            dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Liquidated pool tokens for reserve tokens'}));
          })
        } else {
          dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Liquidated pool tokens for reserve tokens'}));
        }
      })

    },

    fetchConversionVolume: (selectedPool) => {
      const  toCurrencyCode = selectedPool.symbol;
      let  fromCurrencyCode = '';
      if (!selectedPool.reserves || selectedPool.reserves.length === 0) {
        return [];
      }
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
    },
    
    setTokenAllowances: (amount, poolRow, type) => {
       return getSpenderAddress(type, poolRow.converter).then(function(spenderAddress){
         dispatch(getPoolApproval());
        let poolSetAllowance = poolRow.reserves.map(function(item, idx){
          return setTokenAllowance(item.address, spenderAddress, item.decimals, amount).then(function(response){

            return response;
          })
       });
      
      return Promise.all(poolSetAllowance).then(function(response){
            dispatch(getPoolApprovalSuccess());        
        return response;
      });
      
       });
    },
    
    revokeTokenAllowances: (poolRow, type) => {
      return getSpenderAddress(type, poolRow.converter).then(function(spenderAddress){
        dispatch(getPoolRevocation());
      let poolRevokeAllowance = poolRow.reserves.map(function(item, idx){
        return revokeTokenAllowance(item.address,spenderAddress).then(function(response){
          return response;
        })
      });
      
      return Promise.all(poolRevokeAllowance).then(function(response){
        dispatch(getPoolRevocationSuccess());
        return response;
      })
      });
    }
  }
}



function getSpenderAddress(type, converterAddress) {
  if (type === 'pool') {
    return new Promise((resolve, reject) => resolve(converterAddress));
  } else {
    return RegistryUtils.getContractAddress('BancorNetwork').then(function(bnAddress){
          return bnAddress;
        });
  }
}

function getApproval(contract, owner, spender, amount, dispatch) {
  const web3 = window.web3;
  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = allowance;

    const amountAllowed = new Decimal(minAllowance);
    const amountNeeded = new Decimal(minAmount);

    if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isPositive() && !amountAllowed.isZero()) {
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Previous user allowance found. reseting allowance'}));
    return contract.methods.approve(web3.utils.toChecksumAddress(spender), 0).send({
      from: owner
    }).then(function(approveResetResponse){
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval for token transfer'}));
    return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
       from: owner
    }, function(err, txHash){
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Approving token transfer'}));
    }).then(function(allowanceResponse){
        dispatch(setPoolTransactionStatus({type: 'pending', message: 'Token transfer approved.'}));
      return allowanceResponse;
    })
    });
    } else if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isZero()) {
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval for token transfer'}));
        return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
           from: owner
        }, function(err, txHash){
          dispatch(setPoolTransactionStatus({type: 'pending', message: 'Appoving token transfer'}));
        }).then(function(allowanceResponse){
            dispatch(setPoolTransactionStatus({type: 'pending', message: 'Token transfer approved.'}));
          return allowanceResponse;
        })
    } else {
      return null;
    }
  });
  });
}


function getUserPoolHoldings(poolRow) {
  const web3 = window.web3;
  const senderAddress = web3.currentProvider.selectedAddress;
  if (isEmptyString(senderAddress)) {
    return new Promise((resolve)=>(resolve(poolRow)));
  }
  const poolSmartTokenAddress = poolRow.address;
  const SmartTokenContract = new web3.eth.Contract(SmartToken, poolSmartTokenAddress);

  const converterAddress = poolRow.converter;

  return  RegistryUtils.getContractAddress('BancorNetwork').then(function(bnAddress){

   
  let poolReserveHoldingsRequest = poolRow.reserves.map(function(item){
    const reserveTokenAddress = item.address;
    let isEth = false;
    if (item.symbol === 'ETH') {
      isEth = true;
    }
    const BancorConverterContract = new web3.eth.Contract(BancorConverter, poolRow.converter);
    
    return  getBalanceOfToken(reserveTokenAddress, isEth).then(function(balanceResponse){
      
    return  getReserveBalance(BancorConverterContract, reserveTokenAddress).then(function(reserveTokenBalance){
                            
      return getAllowanceOfToken(reserveTokenAddress, converterAddress).then(function(allowanceResponse){
      
      return getAllowanceOfToken(reserveTokenAddress, bnAddress).then(function(swapAllowanceResponse){
        
    
  
      const availableUserBalance = fromDecimals(balanceResponse, item.decimals);
      const availableUserAllowance = fromDecimals(allowanceResponse, item.decimals);
      const availableUserSwapAllowance = fromDecimals(swapAllowanceResponse, item.decimals);
      
      const tokenBalancePayload = {userBalance: availableUserBalance, userAllowance: availableUserAllowance,
        swapAllowance: availableUserSwapAllowance, reserveBalance: reserveTokenBalance,
      };
      
      return Object.assign({}, item, tokenBalancePayload);
      });
      });
      
       });
    })
  });
   return Promise.all(poolReserveHoldingsRequest).then(function(response){
    return getSenderBalanceOfToken(SmartTokenContract, senderAddress).then(function(balanceData){
        poolRow.reserves = response;
        poolRow.senderBalance = balanceData;
        return poolRow;
    });
  });
  
  });
}

function getSenderBalanceOfToken(SmartTokenContract, senderAddress) {
  if (senderAddress === null || senderAddress === undefined) {
    return new Promise((resolve)=>(resolve(0)));
  }
  return SmartTokenContract.methods.balanceOf(senderAddress).call().then(function(balanceData){
    return balanceData;
  });
}

function getReserveBalance(BancorConverterContract, reserveTokenAddress) {
  return  BancorConverterContract.methods.getReserveBalance(reserveTokenAddress).call().then(function(reserveTokenBalance){
    return reserveTokenBalance;
  }).catch(function(err){
    return 0;
  });
}

function createSellWithArguments(args, dispatch) {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;

      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval'}));

      return ConverterContract.methods.liquidate(args.poolTokenSold).send({
        from: senderAddress
      }, function(err, txHash){
        dispatch(setPoolTransactionStatus({type: 'pending', message: 'Liquidating pool tokens into reserve tokens.'}));
      }).then(function(sendResponse){

        let withdrawEth = args.reservesAdded.map(function(reserve){
          if (reserve.symbol === 'ETH') {
            // withdraw from ether token to wallet
            const reserveContract = new web3.eth.Contract(EtherToken, reserve.address);
           return reserveContract.methods.withdraw(reserve.addedMin).send({from: senderAddress}, function(err, txHash){
                   dispatch(setPoolTransactionStatus({type: 'pending', message: 'Withdrawing Ether from contract.'}));
           }).then(function(response){
              return response;
            });
          } else {
            return null;
          }
        }).filter(Boolean);
        if (withdrawEth) {
          Promise.all(withdrawEth).then(function(withdrawEthResponse){
            dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Liquidated pool tokens for reserve tokens'}));
            return;
          })
        } else {
          dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Liquidated pool tokens for reserve tokens'}));
          return;
        }
      })
}

function createBuyWithArguments(args, dispatch) {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      const ConverterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval'}));

      let resNeededApproval = args.reservesNeeded.map(function(item){
        let reserveContract = {};
        if (item.symbol === 'ETH') {
          reserveContract = new web3.eth.Contract(EtherToken, item.address);
          const reserveAmount = item.neededMin;
          // get deposit amount from eth token

          // if amount to deposit is > balance then deposit remainder
          return reserveContract.methods.balanceOf(senderAddress).call().then(function(userBalance){

            
            if ((new Decimal(userBalance)).lessThan(new Decimal(reserveAmount))) {
          
            return reserveContract.methods.deposit().send({from: senderAddress, value: reserveAmount}, function(err, txHash){
                  dispatch(setPoolTransactionStatus({type: 'pending', message: 'Depositing Ether into contract.'}));
          }).then(function(response){
            
            return getApproval(reserveContract, senderAddress, args.converterAddress, reserveAmount, dispatch).then(function(res){
              return response;
            });

          });

          } else {
            
               return getApproval(reserveContract, senderAddress, args.converterAddress, reserveAmount, dispatch).then(function(res){
              return res;
            });
          }
          });
        } else {
          reserveContract = new web3.eth.Contract(ERC20Token, item.address);
          const reserveAmount = item.neededMin;
          return getApproval(reserveContract, senderAddress,  args.converterAddress, reserveAmount, dispatch).then(function(res){
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
            dispatch(setPoolTransactionStatus({type: 'success', message: 'Successfully Funded pool with reserve tokens'}));
          })
      })
}




export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);