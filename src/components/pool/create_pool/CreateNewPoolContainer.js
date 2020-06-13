import CreateNewPool from './CreateNewPool';

import {connect} from 'react-redux';
import { deployRelayConverterStatus, setPoolFundedStatus,
     setTokenListDetails, resetPoolStatus, setPoolFundedSuccess,activateConverterStatus
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

   fetchPoolAndConverterDetails: (address) => {

       ConverterUtils.getPoolAnchors(address).then(function(poolAnchors){
         console.log(poolAnchors);
       });
       
     
   },

    getTokenDetailFromAddress: (val, idx) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      const ERC20TokenContract = new web3.eth.Contract(ERC20Token, val);
      if (val && val.length > 0) {

      ERC20TokenContract.methods.symbol().call().then(function(tokenSymbol){
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
          const poolData = {'idx': idx, 'data': {'address': val, 'symbol': tokenSymbol, 'price': tokenPrice}};
         dispatch(setTokenListDetails(poolData));
        })
        })
        });
      })
      }

    },

    fundRelayWithSupply: (args) => {

      const web3 = window.web3;

      const smartTokenAddress = args.smartTokenAddress;

      const bancorConverterAddress = args.converterAddress;

      const smartTokenContract = new web3.eth.Contract(SmartToken, smartTokenAddress);

      const senderAddress = web3.currentProvider.selectedAddress;

      const supplyAmount = toDecimals(args.initialSupply, 18);

      const convertibleTokens = args.convertibleTokens;
      dispatch(setPoolFundedStatus({'type': 'pending', 'message': "Waiting for user approval of pool supply"}));
      smartTokenContract.methods.issue(senderAddress, supplyAmount).send({from: senderAddress}, function(err, txHash){

      dispatch(setPoolFundedStatus({'type': 'pending', 'message': "Creating initial pool supply"}));
      }).then(function(response){
        (async () => {
        let totalConversions = convertibleTokens.length - 1;
        for (let job of convertibleTokens.map((x, idx) => () =>
          approveAndFundPool(x, bancorConverterAddress, dispatch, idx, totalConversions)
        ))
        await job();
        dispatch(setPoolFundedSuccess());
        })();
      });
    },

    activatePool: (args) => {

      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;


    },

    getConverterAndPoolDetails: (args) => {
      const web3 = window.web3;


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

function getTokenListData(tokenList) {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
      let tokenDetailList = tokenList.map(function(item){
      const val = item.address;
      const ERC20TokenContract = new web3.eth.Contract(ERC20Token, val);

      return  ERC20TokenContract.methods.symbol().call().then(function(tokenSymbol){

     return ERC20TokenContract.methods.symbol().call().then(function(tokenSymbol){
        let isEth = false;
        if (tokenSymbol === 'ETH') {
          isEth = true;
        }
      return  ERC20TokenContract.methods.decimals().call().then(function(decimals){
      return  getFullBalanceOfToken(val, isEth).then(function(senderBalance){
          let senderDecimalBalance = fromDecimals(senderBalance, decimals);
          return  axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USD`).then(function(dataResponse){
            let tokenPrice = "";
            if (dataResponse.data && dataResponse.data.USD) {
              tokenPrice = dataResponse.data.USD;
            }
            let returnData = Object.assign({}, item, {'symbol': tokenSymbol, 'price': tokenPrice, 'senderBalance': senderDecimalBalance});
            return returnData;
          })
        })
      });
        });

      });

      });

      return Promise.all(tokenDetailList).then(function(detailListData){
        return detailListData.filter(Boolean);
      });
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateNewPool);