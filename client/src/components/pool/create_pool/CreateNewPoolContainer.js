import CreateNewPool from './CreateNewPool';

import {connect} from 'react-redux';
import {deploySmartTokenInit, deploySmartTokenPending, deploySmartTokenReceipt, deploySmartTokenConfirmation,
  deploySmartTokenError, deploySmartTokenSuccess, deployRelayTokenStatus, setRelayTokenContractReceipt, setPoolFundedStatus,
} from '../../../actions/pool';
import {toDecimals, fromDecimals} from '../../../utils/eth';
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
    deployPoolContract: (args) => {
        const web3 = window.web3;
        
        const walletAddress = web3.currentProvider.selectedAddress;
        
        const smartTokenContract = new web3.eth.Contract(SmartToken);
    
        const bytecode ='0x' + SmartTokenByteCode.ByteCode;
        
        dispatch(deploySmartTokenInit({'message': 'Waiting for user approval', 'symbol': args.poolSymbol}));
                  
        let deployer = smartTokenContract.deploy({data : bytecode, arguments: [
          args.poolName, 
          args.poolSymbol,
          args.poolDecimals
          ]});
    
          deployer.send({
            from: walletAddress
        
        }, function(error, transactionHash){ 
          if (error) {
            dispatch(deploySmartTokenError(error));
          }
          dispatch(deploySmartTokenPending(transactionHash));
        })
        .on('error', function(error){ 
         dispatch(deploySmartTokenError(error));
        })
        .on('transactionHash', function(transactionHash){ 
           dispatch(deploySmartTokenPending(transactionHash));
        })
        .on('receipt', function(receipt){
         dispatch(deploySmartTokenReceipt(receipt));
        })
        .on('confirmation', function(confirmationNumber, receipt){
          dispatch(deploySmartTokenConfirmation(receipt));
          
        })
        .then(function(newContractInstance){
          dispatch(deploySmartTokenSuccess(newContractInstance));
        });
    
    },
    
    deployRelayConverter: (args) => {

    const maxFee = args.maxFee * 10000;
    const reserveWeight = args.reserveWeight * 10000;
    const convertibleWeight = args.convertibleWeight * 1000;
    const conversionFee = args.conversionFee * 10000;
    const smartTokenAddress = args.smartTokenAddress;
    const web3 = window.web3;
    
    RegistryUtils.getContractAddress('ContractRegistry').then(function(contractRegistryContractAddress){
      const walletAddress = web3.currentProvider.selectedAddress;
      const bancorConverterContract = new web3.eth.Contract(BancorConverter);
      const bytecode ='0x' + BancorConverterByteCode.ByteCode;

    const deployer = bancorConverterContract.deploy({data : bytecode, arguments: [
                      smartTokenAddress, 
                      contractRegistryContractAddress,
                      maxFee,
                      BNT_TOKEN_ID,
                      reserveWeight
                    ]});
      
      deployer.send({
        from: walletAddress
    
      }, function(error, transactionHash){ 

       })
      .on('error', function(error){ 
        dispatch(deployRelayTokenStatus({type: 'error', message: error.message}))
      })
      .on('transactionHash', function(transactionHash){ 
          dispatch(deployRelayTokenStatus({type: 'pending',
          message: `Deploying Bancor converter contract hash ${transactionHash}`}));
      })
      .on('receipt', function(receipt){

   
      })
      .on('confirmation', function(confirmationNumber, receipt){
          dispatch(deployRelayTokenStatus({type: 'pending',
          message: `Finished deplying Bancor converter contract `}));

          dispatch(setRelayTokenContractReceipt(receipt))        
      })
      .then(function(deployerContractInstance){
          dispatch(deployRelayTokenStatus({type: 'pending',
          message: `Adding network connector`}));
        
        console.log(deployerContractInstance);
        
        deployerContractInstance.methods.addConnector(args.convertibleTokenAddress, convertibleWeight, false).call()
        .then(function(data){
          dispatch(deployRelayTokenStatus({type: 'pending',
          message: `Setting conversion fees`}));
          deployerContractInstance.methods.setConversionFee(conversionFee).call().then(function(dataRes){

          dispatch(deployRelayTokenStatus({type: 'success',
          message: `Relay token is ready to be used`}));
    
            
          })
        })

      });
    
  });
      
      
    },
    
    fundRelayWithSupply: (args) => {
      const web3 = window.web3;
      const convertibleTokenAddress = args.convertibleTokenAddress;
      const convertibleTokenAmount = args.convertibleTokenAmount;
      
      const convertibleTokenMinAmount = toDecimals(convertibleTokenAmount, 18);
      const reserveTokenAmount = args.reserveTokenAmount;

      
      const smartTokenAddress = args.smartTokenAddress;

      const bancorConverterAddress = args.converterAddress;
      
      const senderAddress = web3.currentProvider.selectedAddress;
          
      let convertibleTokenContract = new web3.eth.Contract(ERC20Token, convertibleTokenAddress);
      let reserveTokenContract = new web3.eth.Contract(ERC20Token, BNT_TOKEN_ID);
      
      
      const smartTokenContract = new web3.eth.Contract(SmartToken, smartTokenAddress);
      
      reserveTokenContract.methods.decimals().call().then(function(numDecimals){

         const reserveTokenMinAmount = toDecimals(reserveTokenAmount, numDecimals);

      let supplyAmount = toDecimals(reserveTokenAmount * 2, 18);
      
      smartTokenContract.methods.issue(senderAddress, supplyAmount).send({
            from: senderAddress
      }).then(function(issueResponse){

            reserveTokenContract.methods.transfer(bancorConverterAddress, reserveTokenMinAmount).send({
              from: senderAddress
            }).then(function(rsResponse){
      convertibleTokenContract.methods.approve(bancorConverterAddress, convertibleTokenMinAmount).send({
        from: senderAddress
      }).then(function(approvalResponse){
        dispatch(setPoolFundedStatus({type: 'pending', message:'Waiting for user approval for network token transfer'}));
        convertibleTokenContract.methods.transfer(bancorConverterAddress, convertibleTokenMinAmount).send({
          from: senderAddress
        }).then(function(txResponse){
          dispatch(setPoolFundedStatus({type: 'success', message:'finished funding pool with initial liquidity'}));
                      console.log(txResponse);
                      console.log(rsResponse);
            })
          })
        })
        

          
      })
      
      })
      

    },
    
    activatePool: (args) => {
      const web3 = window.web3;
      const senderAddress = web3.currentProvider.selectedAddress;
            
      const smartTokenContract = new web3.eth.Contract(SmartToken, args.smartTokenAddress);
      const converterContract = new web3.eth.Contract(BancorConverter, args.converterAddress);
      
      console.log(smartTokenContract);
      
      smartTokenContract.methods.transferOwnership(args.converterAddress).send({
        from: senderAddress
      }).then(function(transferOwnershipResponse){
        converterContract.methods.acceptTokenOwnership().send({
          from: senderAddress 
        }).then(function(senderAcceptResponse){
          console.log(senderAcceptResponse);
        })
      })
      
    }
    

  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateNewPool);