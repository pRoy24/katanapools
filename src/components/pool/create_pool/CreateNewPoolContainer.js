import CreateNewPool from './CreateNewPool';

import {connect} from 'react-redux';
import { deployRelayConverterStatus, setPoolFundedStatus,
     setTokenListDetails, resetPoolStatus, setPoolFundedSuccess,activateConverterStatus, setCreatePool
} from '../../../actions/pool';
import {refetchSmartAndConvertibleTokens, refetchSmartAndConvertibleTokensSuccess, refetchSmartAndConvertibleTokensFailure} from '../../../actions/tokens';


import {isNonEmptyObject} from '../../../utils/ObjectUtils';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {getFullBalanceOfToken} from '../../../utils/ConverterUtils';

const SmartToken = require('../../../contracts/SmartToken.json');
const LiquidityPoolConverter = require('../../../contracts/LiquidityPoolV1Converter.json');
const RegistryUtils = require('../../../utils/RegistryUtils');

const ConverterUtils = require('../../../utils/ConverterUtils');

const BancorConverterRegistry = require('../../../contracts/ConverterRegistry.json');
const axios = require('axios');
const ERC20Token = require('../../../contracts/ERC20Token.json');
const EtherToken = require('../../../contracts/EtherToken.json');

const Decimal = require('decimal.js');
const BigNumber = require('bignumber.js');



const mapStateToProps = state => {
  return {
    pool: state.pool,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

   resetPoolStatus: () => {
     dispatch(resetPoolStatus());
   },

   deployNewPool: (args) => {
     const web3 = window.web3;
     
    const walletAddress = web3.currentProvider.selectedAddress;     

     RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(converterRegistryAddress){
       const ConverterRegistryContract = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);
       const poolTokenName = args.poolName;
       const poolTokenSymbol = args.poolSymbol;
       const poolTokenDecimals = args.poolDecimals;
       const poolTokenReserves = args.reserves;
       const poolTokenWeights = args.weights;
       const maxConversionFee = 3 * 10000;
       const poolType = 1;

       ConverterRegistryContract.methods.newConverter(
           poolType,
           poolTokenName,
           poolTokenSymbol,
           poolTokenDecimals,
           maxConversionFee,
           poolTokenReserves,
           poolTokenWeights
         ).send({
          from: walletAddress
         }, function(error, transactionHash) {
          dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Deploying Pool converter contract`, transactionHash:transactionHash}))
         }).then(function(response){
           dispatch(deployRelayConverterStatus({type: 'success', message: response}))
        }).catch(function(err){
          dispatch(deployRelayConverterStatus({type: 'error', message: err.message}))
       })
     })
   },
   
   fetchPoolDetails: (poolData) => {
     const poolAddress = poolData.pool;
     const reserves = poolData.reserves;
     ConverterUtils.fetchPoolDetails(poolAddress).then(function(response){
       getReserveDetails(reserves).then(function(reserveDetails){
         const responseData = Object.assign({}, response, {'reserves': reserveDetails});
         dispatch(setCreatePool(responseData));
       });
     })
   },

   acceptPoolOwnership: (args) => {
      const web3 = window.web3;
      const walletAddress = web3.currentProvider.selectedAddress;     
      const {converterAddress} = args;
      console.log("Converter address" +converterAddress);
      const ConverterContract = new web3.eth.Contract(LiquidityPoolConverter, converterAddress);
    
      ConverterContract.methods.acceptOwnership().send({
        from: walletAddress
      }, function(err, transactionHash){
        dispatch(activateConverterStatus({type: 'pending', message: `Transferring converter ownership`}))
      }).then(function(response){
        
        dispatch(activateConverterStatus({type: 'success', message: response}))
      }).catch(function(err){
        dispatch(activateConverterStatus({type: 'failure', message: err}))
      })
    },

   getTokenDetailFromAddress: (val, idx) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      const ERC20TokenContract = new web3.eth.Contract(ERC20Token, val);
      if (val && val.length > 0) {

      ERC20TokenContract.methods.symbol().call().then(function(tokenSymbol){
        
        ERC20TokenContract.methods.decimals().call().then(function(decimals){
          
      
        let isEth = false;
        if (tokenSymbol === 'ETH') {
          isEth = true;
        }
        getFullBalanceOfToken(val, isEth).then(function(senderBalance){
        ERC20TokenContract.methods.balanceOf(senderAddress).call().then(function(senderBalance){

        axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USD`).then(function(dataResponse){
          let tokenPrice = "";
          if (dataResponse.data && dataResponse.data.USD) {
            tokenPrice = dataResponse.data.USD;
          }
          const poolData = {'idx': idx, 'data': {'address': val, 'symbol': tokenSymbol, 'price': tokenPrice, "decimals": decimals}};
         dispatch(setTokenListDetails(poolData));
        })
        })
        });
        
        });
      })
      }

    },
    
    setConversionFee: (converterAddress, value) => {
      const web3 = window.web3;
      const ConverterContract = new web3.eth.Contract(LiquidityPoolConverter, converterAddress);
      const feeValue = parseInt(Number(value) * 10000, 10);

      const walletAddress = web3.currentProvider.selectedAddress;
      
      ConverterContract.methods.setConversionFee(feeValue).send({
        from: walletAddress
      }).then(function(response){
        console.log(response);
      })
    },
    
    approveAndFundPool: (reserveList, amountList, converterAddress) => {
      const web3 = window.web3;
      const ConverterContract = new web3.eth.Contract(LiquidityPoolConverter, converterAddress);
      const walletAddress = web3.currentProvider.selectedAddress;

      let poolApprovals = reserveList.map(function(item, idx){
        const ReserveTokenContract = new web3.eth.Contract(ERC20Token, item);
        return ConverterUtils.getContractApproval(ReserveTokenContract, converterAddress, amountList[idx]).then(function(approval){
          return approval;
        })
      });
      console.log("&&&");
      console.log(reserveList);
      console.log(amountList);
      console.log(walletAddress);
      Promise.all(poolApprovals).then(function(approvalResponse){

        ConverterContract.methods.addLiquidity(reserveList, ['100000000000000000', '100000000000000000'] , 1).send({
          from: walletAddress
          }).then(function(fundingResponse){
          console.log("Finished funding");
          console.log(fundingResponse);
        }).catch(function(err){
          console.log(err);
        })
        
      })
      
    },

    activatePool: (args) => {

      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;


    },

    refetchSmartAndConvertibleTokens: () => {
      dispatch(refetchSmartAndConvertibleTokens()).then(function(response){
        if (response.payload.status === 200) {
          refetchSmartAndConvertibleTokensSuccess(response.payload.data);  
        }
      }).catch(function(err){
        refetchSmartAndConvertibleTokensFailure(err);
      })
    }
  }
}

async function approveAndFundPool(convertibleToken, bancorConverterAddress, dispatch, idx, totalConversions) {

      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      const convertibleTokenAddress = convertibleToken.address;
      const convertibleTokenSymbol = convertibleToken.symbol;
      let isEth = false;
      if (convertibleTokenSymbol === 'ETH') {
        isEth = true;
      }
      const convertibleTokenContract = new web3.eth.Contract(ERC20Token, convertibleToken.address);

      return convertibleTokenContract.methods.decimals().call().then(function(decimals){

      const convertibleTokenAmount = parseFloat(convertibleToken.amount);

      let convertibleTokenApprovalAmount = convertibleTokenAmount;

      const convertibleTokenMinAmount = toDecimals(convertibleTokenAmount, decimals);

      const convertibleTokenMinApprovalAmount = toDecimals(convertibleTokenApprovalAmount, decimals);

      return getPoolDepositStatus(convertibleTokenAddress, convertibleTokenAmount,
      isEth, dispatch).then(function(depositStatus){

      return convertibleTokenContract.methods.allowance(senderAddress, bancorConverterAddress).call().then(function(allowance) {
        if (!allowance || typeof allowance === undefined) {
          allowance = 0;
        }

        const required = new BigNumber(convertibleTokenMinApprovalAmount);

        let diff = new BigNumber(allowance).minus(required);

        if (diff.isNegative()) {
          dispatch(setPoolFundedStatus({'type': 'pending', 'message': `waiting for user approval for ${convertibleToken.symbol} transfer`}));
          return convertibleTokenContract.methods.approve(bancorConverterAddress, convertibleTokenMinApprovalAmount).send({
            from: senderAddress
          }, function(err, txHash){

            dispatch(setPoolFundedStatus({'type': 'pending', 'message': `Authorizing ${convertibleToken.symbol} transfer to contract`}));
          }).then(function(approval){
            dispatch(setPoolFundedStatus({'type': 'pending', 'message': `Waiting for user signature for ${convertibleToken.symbol} transfer`}));
          return convertibleTokenContract.methods.transfer(bancorConverterAddress, convertibleTokenMinAmount).send({from: senderAddress}, function(err, txHash){
              dispatch(setPoolFundedStatus({'type': 'pending', 'message': `Transferring ${convertibleToken.amount} ${convertibleToken.symbol} to contract`}));
            }).then(function(txSuccess){
              if (idx === totalConversions) {
                dispatch(setPoolFundedStatus({'type': 'success', 'message': `Finished creating pool supply and token transfer`}));
              }
              return;
            });
          });

      } else {
        return convertibleTokenContract.methods.transfer(bancorConverterAddress, convertibleTokenMinAmount).send({from: senderAddress}, function(err, txHash){
          }).then(function(txSuccess){

              if (idx === totalConversions) {
                dispatch(setPoolFundedStatus({'type': 'success', 'message': `Finished creating pool supply and token transfer`}));
              }
              return;
          });
      }

  })
      });
  });

}


function getPoolDepositStatus(contractAddress, value, isEth, dispatch) {

  if (!isEth) {
    return new Promise((resolve, reject)=>(resolve()));
  }
  const web3 = window.web3;
  const senderAddress = web3.currentProvider.selectedAddress;

  const etherContract = new web3.eth.Contract(EtherToken, contractAddress);
  return etherContract.methods.balanceOf(senderAddress).call().then(function(addressBalanceResponse){
          const addressDepositBalance = new Decimal(fromDecimals(addressBalanceResponse, 18));
          const requiredAmount = new Decimal(value);

        if (addressDepositBalance.lessThan(requiredAmount)) {
          const moreNeeded = requiredAmount.minus(addressDepositBalance).toFixed(6);

          const moreNeededMin = toDecimals(moreNeeded, 18);
          return etherContract.methods.deposit().send({from: senderAddress, value: moreNeededMin}, function(err, txHash){
                  dispatch(setPoolFundedStatus({type: 'pending', message: 'Depositing Ether into contract.'}));
          }).then(function(response){
            return response;
          });

        } else {
          return;
        }

  });
}


function getReserveDetails(reserveList) {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
    
      
     let reserveListData = reserveList.map(function(item, idx){
         const ERC20TokenContract = new web3.eth.Contract(ERC20Token, item);
         let isEth = false;
         if (item === '0x00000') {
           isEth = true;
         }
        return ERC20TokenContract.methods.symbol().call().then(function(tokenSymbol){
          return  ERC20TokenContract.methods.decimals().call().then(function(decimals){
          return getFullBalanceOfToken(item, isEth).then(function(senderBalance){
            return axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USD`).then(function(dataResponse){
              let tokenPrice = "";
              if (dataResponse.data && dataResponse.data.USD) {
                  tokenPrice = dataResponse.data.USD;
              }
              const reserveData = {'idx': idx, 'data': {'address': item, 'symbol': tokenSymbol, 'price': tokenPrice, 
                'decimals': decimals
              }};
              return reserveData;
            }).catch(function(err){
                   const reserveData = {'idx': idx, 'data': {'address': item, 'symbol': tokenSymbol, 'price': 0,
                          'decimals': decimals
                   }};
                   return reserveData;
            })            
          });
          
          });
        });
     });
     
     return Promise.all(reserveListData).then(function(reserveDataResponse){
       return reserveDataResponse;
     })  
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateNewPool);