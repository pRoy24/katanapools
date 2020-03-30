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
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

    getPoolDetails: (poolRow) => {
        dispatch(setCurrentSelectedPool({}));
        getPoolRowMeta(poolRow, dispatch);
    },

    refetchPoolDetails: (poolRow) => {
        getPoolRowMeta(poolRow, dispatch);
    },

    submitPoolBuy: (args) => {
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


          return reserveContract.methods.deposit().send({from: senderAddress, value: reserveAmount}, function(err, txHash){
                  dispatch(setPoolTransactionStatus({type: 'pending', message: 'Depositing Ether into contract.'}));
          }).then(function(response){
            return getApproval(reserveContract, senderAddress, args.converterAddress, reserveAmount, dispatch).then(function(res){
              return response;
            });
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

function getApproval(contract, owner, spender, amount, dispatch) {

  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = toDecimals(allowance, amountDecimals);
    let diff = new BigNumber(minAllowance).minus(new BigNumber(minAmount));

    if (diff.isNegative()) {
      dispatch(setPoolTransactionStatus({type: 'pending', message: 'Waiting for user approval'}));
    return contract.methods.approve(spender, minAmount).send({
      from: owner
    }, function(err, txHash){
        dispatch(setPoolTransactionStatus({type: 'pending', message: 'Approving token transfer.'}));
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

function getPoolRowMeta(poolRow, dispatch) {
        const web3 = window.web3;

        const senderAddress = web3.currentProvider.selectedAddress;


        RegistryUtils.getConverterRegistryAddress().then(function(converterContractRegistryAddress){
          const poolSmartTokenAddress = poolRow.address;

          RegistryUtils.getTokenDetails(poolSmartTokenAddress).then(function(smartTokenDetails){
          console.log('here');
          console.log(new Date());
          console.log(smartTokenDetails);
dispatch(setCurrentSelectedPool(smartTokenDetails));

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
                          console.log('there');
                          return reserveData;
                        })
                       })
                      });
                    })
            });



            BancorConverterContract.methods.conversionFee().call().then(function(conversionFee){
              const conversinFeePercent = conversionFee / 10000;


                     Promise.all(reserveTokenData).then(function(reserveDetail){

                       getSenderBalanceOfToken(SmartTokenContract, senderAddress).then(function(balanceData){


                        reserveDetail = reserveDetail.filter(Boolean);
                        const finalPayload = Object.assign({}, smartTokenDetails, {senderBalance: balanceData}, {converter: poolConverterAddress},
                        {reserves: reserveDetail}, {conversionFee: conversinFeePercent});
                        dispatch(setCurrentSelectedPool(finalPayload));
                     })
                     });
                      })
                    });
                  });
            }).catch(function(err){
            dispatch(setCurrentSelectedPool({}));
          });
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



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPools);