import CreateNewPool from './CreateNewPool';

import {connect} from 'react-redux';
import {deploySmartTokenInit, deploySmartTokenPending, deploySmartTokenReceipt, deploySmartTokenConfirmation,
  deploySmartTokenError, deploySmartTokenSuccess, deployRelayConverterStatus, setRelayTokenContractReceipt, setPoolFundedStatus,
  setActivationStatus, setPoolCreationReceipt, setTokenListDetails, resetPoolStatus,
  deployRelayConverterSuccess, setPoolFundedSuccess, setCurrentPoolStatus, setConverterContract,
  setPoolCreationHeader
} from '../../../actions/pool';
import {refetchSmartAndConvertibleTokens, refetchSmartAndConvertibleTokensSuccess, refetchSmartAndConvertibleTokensFailure} from '../../../actions/tokens';


import {isNonEmptyObject} from '../../../utils/ObjectUtils';
import {toDecimals, fromDecimals} from '../../../utils/eth';
import {getFullBalanceOfToken} from '../../../utils/ConverterUtils';

const SmartToken = require('../../../contracts/SmartToken.json');
const SmartTokenByteCode = require('../../../contracts/SmartTokenByteCode.js');
const RegistryUtils = require('../../../utils/RegistryUtils');
const BancorConverter = require('../../../contracts/BancorConverter.json');
const BancorConverterByteCode = require('../../../contracts/BancorConverterByteCode.js');
const ContractRegistry = require('../../../contracts/ContractRegistry.json');
const BancorConverterRegistry = require('../../../contracts/BancorConverterRegistry.json');
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
    deployPoolContract: (args) => {

    },

   resetPoolStatus: () => {
     dispatch(resetPoolStatus());
   },

   resumeDeployRelayConverter: (args, poolCompletionStatus) => {

   },

   deployRelayConverter: (args) => {
      let poolStepsCompletionStatus = [
        {type: 'deployPoolToken', status: false},
        {type: 'deployRelayConverter', status: false},
        {
          'connectors': [

            ]
        }
      ];
      dispatch(setCurrentPoolStatus(poolStepsCompletionStatus));

      const web3 = window.web3;


      const conversionFee = args.reserveFee * 10000;
      const maxFee = 3 * 10000;

      let tokenAddressList = args.tokenAddressList;


      const relayToken = tokenAddressList.find((i)=>(i.type === 'relay'));
      let relayTokenAddress = '0x0000000000000000000000000000000000000000';
      let relayTokenWeight = 0;
      if (isNonEmptyObject(relayToken)) {
        relayTokenAddress = relayToken.address;
        relayTokenWeight = relayToken.weight * 10000;
      }

      const walletAddress = web3.currentProvider.selectedAddress;
      const bancorConverterContract = new web3.eth.Contract(BancorConverter);
      const bytecode ='0x' + BancorConverterByteCode.ByteCode;

      deployPoolContract(args, dispatch).then(function(contractResponse){

        poolStepsCompletionStatus[0].status = true;
        dispatch(setCurrentPoolStatus(poolStepsCompletionStatus));

      getTokenListData(tokenAddressList).then(function(tokenListDetails){

      dispatch(setTokenListDetails(tokenListDetails));

      // Deploy the converter and add the first reserve i.e. relay token BNT or USDB as first step
      RegistryUtils.getContractAddress('ContractRegistry').then(function(contractRegistryContractAddress){

      const smartTokenAddress = contractResponse._address;

      const deployer = bancorConverterContract.deploy({data : bytecode, arguments: [
                        smartTokenAddress,
                        contractRegistryContractAddress,
                        maxFee,
                        relayTokenAddress,
                        relayTokenWeight
                      ]});
      dispatch(deployRelayConverterStatus({type: 'pending', message: `Waiting for user approval to deploy converter contract`}));
      deployer.send({
        from: walletAddress
      }, function(error, transactionHash){
            dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Deploying Pool converter contract`, transactionHash:transactionHash}));
       })
      .on('error', function(error){
        dispatch(deployRelayConverterStatus({type: 'error', message: error.message}))
      }).then(function(deployerContractInstance){
        dispatch(setConverterContract(deployerContractInstance));

        poolStepsCompletionStatus[1].status = true;
        dispatch(setCurrentPoolStatus(poolStepsCompletionStatus));
          dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Adding relay connectors`}));
          let convertibleTokenDeploy = tokenAddressList.filter((a)=>(a.type === 'convertible')).map(function(item, idx){
          let itemWeight = item.weight * 10000;
          dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Waiting for user approval for adding ${item.symbol} connector`}));
              return  deployerContractInstance.methods.addReserve(item.address, itemWeight).send({
                  from: walletAddress
              }, function(err, txHash){
          dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Deploying reserve token connector for ${item.symbol}`}));
              }).then(function(data){
          dispatch(deployRelayConverterStatus({type: 'pending',
          message: `Finished deploying ${item.symbol} reserve connector`}));
                  return data;
              });
          });
          Promise.all(convertibleTokenDeploy).then(function(response){
                dispatch(deployRelayConverterStatus({type: 'pending', message: `Waiting for user approval to set conversion fees`}));
              deployerContractInstance.methods.setConversionFee(conversionFee).send({from: walletAddress}, function(err, txHash){
                dispatch(deployRelayConverterStatus({type: 'pending', message: `Setting conversion fees`, transactionHash: txHash}));
              }).then(function(dataRes){
                dispatch(deployRelayConverterStatus({type: 'success', message: `Relay token is ready to be used`}));
                dispatch(deployRelayConverterSuccess());
              });
          });
      });

  });

    });
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

      const smartTokenContract = new web3.eth.Contract(SmartToken, args.smartTokenAddress);
      const converterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      dispatch(setActivationStatus({'type': 'pending', 'message': 'Waiting for user approval to transfer pool ownership'}));
      smartTokenContract.methods.transferOwnership(args.converterAddress).send({
        from: senderAddress
      }, function(err, txHash){
        dispatch(setActivationStatus({'type': 'pending', 'message': 'Transferring ownership of pool to converter'}));
      }).then(function(transferOwnershipResponse){
          dispatch(setActivationStatus({'type': 'pending', 'message': 'Waiting for user approval to accept pool token ownership'}));
        converterContract.methods.acceptTokenOwnership().send({
          from: senderAddress
        }, function(err, txHash){
          dispatch(setActivationStatus({'type': 'pending', 'message': 'Converter contract is accepting pool token ownership'}));
        }).then(function(senderAcceptResponse){
          dispatch(setActivationStatus({'type': 'pending', 'message': 'Waiting for user approval to register converter contract to registry'}));
          RegistryUtils.getConverterRegistryAddress().then(function(contractRegistryContractAddress){
          const ConverterRegistryContract = new web3.eth.Contract(BancorConverterRegistry, contractRegistryContractAddress);
          ConverterRegistryContract.methods.addConverter(args.converterAddress).send({
            from: senderAddress
          }, function(err, txHash){
            dispatch(setActivationStatus({'type': 'pending', 'message': 'Registering converter contract with converter registry'}));
          }).then(function(converterRegistryAddedResponse){
            dispatch(setPoolCreationHeader('Your pool has been created'));
            dispatch(setActivationStatus({'type': 'success', 'message': 'Finished activating pool'}));
          });
          });
        })
      })

    },

    getConverterAndPoolDetails: (args) => {
      const web3 = window.web3;

      const poolTokenAddress = args.poolTokenAddress;
      const converterAddress = args.converterAddress;

      const BancorConverterContract =  new web3.eth.Contract(BancorConverter, converterAddress);
      const PoolTokenContract = new web3.eth.Contract(SmartToken, poolTokenAddress);


      PoolTokenContract.methods.name().call().then(function(poolName){
        PoolTokenContract.methods.symbol().call().then(function(poolSymbol){
          PoolTokenContract.methods.decimals().call().then(function(poolDecimals){


          PoolTokenContract.methods.totalSupply().call().then(function(poolSupply){


          BancorConverterContract.methods.connectorTokenCount().call().then(function(connectorTokenCount){
            BancorConverterContract.methods.connectorTokens(0).call().then(function(token1){

              BancorConverterContract.methods.getReserveRatio(token1).call().then(function(connectorReserveRatio){

              BancorConverterContract.methods.getReserveBalance(token1).call()
              .then(function(connectorReserveBalance){
                const payload = {connectorBalance: fromDecimals(connectorReserveBalance, 18), decimals: poolDecimals,
                  connectorWeight: connectorReserveRatio / 10000, poolName: poolName, poolSymbol: poolSymbol,
                  poolSupply: fromDecimals(poolSupply, poolDecimals), numConnectors: connectorTokenCount,
                  connectorAdress: token1,
                };

                dispatch(setPoolCreationReceipt(payload));
            })
          })
        })
          })
          })
          })
      })
      })
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

function deployPoolContract(args, dispatch) {
  const web3 = window.web3;

  const walletAddress = web3.currentProvider.selectedAddress;

  const smartTokenContract = new web3.eth.Contract(SmartToken);

  const bytecode ='0x' + SmartTokenByteCode.ByteCode;

  dispatch(deploySmartTokenInit({'message': 'Waiting for user approval to deploy pool token', 'symbol': args.poolSymbol}));

  let deployer = smartTokenContract.deploy({data : bytecode, arguments: [
    args.poolName,
    args.poolSymbol,
    args.poolDecimals
    ]});

  return deployer.send({
      from: walletAddress

  }, function(error, transactionHash){
    if (error) {
      dispatch(deploySmartTokenError(error.message));
    } else {
      dispatch(deploySmartTokenPending({'transactionHash': transactionHash}));
    }
  })
  .then(function(newContractInstance){
    dispatch(deploySmartTokenSuccess(newContractInstance));
    return newContractInstance;
  });
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateNewPool);