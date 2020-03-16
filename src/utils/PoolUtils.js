const SmartToken = require('../contracts/SmartToken.json');
const SmartTokenByteCode = require('../contracts/SmartTokenByteCode.js');
const BancorConverter = require('../contracts/BancorConverter.json');
const BancorConverterByteCode = require('../contracts/BancorConverterByteCode.js');
const ContractRegistry = require('../contracts/ContractRegistry.json');
const ERC20Token = require('../contracts/ERC20Token.json');
const RegistryUtils = require('./RegistryUtils');



module.exports = {
  deploySmartToken: function(args) {

    const web3 = window.web3;
    
    const walletAddress = web3.currentProvider.selectedAddress;
    
    const smartTokenContract = new web3.eth.Contract(SmartToken);

    const bytecode ='0x' + SmartTokenByteCode.ByteCode;
    
    let deployer = smartTokenContract.deploy({data : bytecode, arguments: [
      args.poolName, 
      args.poolSymbol,
      args.poolDecimals
      ]});
    
    
    return new Promise((resolve, reject) => {
      deployer.send({
        from: walletAddress
    
    }, function(error, transactionHash){ 
      
     // console.log(transactionHash);
       })
    .on('error', function(error){ 
      reject(error)
    })
    .on('transactionHash', function(transactionHash){ //console.log(transactionHash)
    })
    .on('receipt', function(receipt){
      resolve(receipt);
    })
    .on('confirmation', function(confirmationNumber, receipt){ console.log(receipt) })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
    });
    
    
    })
        
  },
  
  deployConverter: function(args) {

    const tokenSymbol = args.tokenSymbol;
    const maxFee = args.maxFee * 10000;
    const reserveWeight = args.reserveWeight * 10000;
    const convertibleWeight = args.convertibleWeight * 1000;
    const conversionFee = args.conversionFee * 10000;
    const smartTokenAddress = args.smartTokenAddress;
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    
    let BNT_TOKEN_ID = process.env.REACT_APP_BNT_ID_MAINNET;
    if (currentNetwork === 3) {
      BNT_TOKEN_ID = process.env.REACT_APP_BNT_ID_ROPSTEN;
    }
    
    return new Promise((resolve, reject) => {
            
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
        reject(error);
      })
      .on('transactionHash', function(transactionHash){ //console.log(transactionHash)
      })
      .on('receipt', function(receipt){
        resolve(receipt);
   
      })
      .on('confirmation', function(confirmationNumber, receipt){
      //  console.log(receipt) 
        
      })
      .then(function(deployerContractInstance){

        deployerContractInstance.methods.addConnector(args.convertibleTokenAddress, convertibleWeight, false).send({
        from: walletAddress
    
      }, function(error, transactionHash){ 

       })
      .on('error', function(error){ 
        reject(error);
      })
      .on('transactionHash', function(transactionHash){ //console.log(transactionHash)
      })
      .on('receipt', function(receipt){
        resolve(receipt);
   
      })
      .on('confirmation', function(confirmationNumber, receipt){

      //  console.log(receipt) 
        
      }).then(function(deployerInstance){
        console.log(deployerInstance);
        
        deployerContractInstance.methods.setConversionFee(conversionFee).send({
        from: walletAddress
    
      }, function(error, transactionHash){ 

       })
      .on('error', function(error){ 
        reject(error);
      })
      .on('transactionHash', function(transactionHash){ //console.log(transactionHash)
      })
      .on('receipt', function(receipt){
        resolve(receipt);
   
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('conversion fee set ');
        console.log(receipt);
      //  console.log(receipt) 
        
      })
        
      })
        
        //  console.log(newContractInstance.options.address) // instance with the new contract address
      });
    
  });
      
    })
  },
  
  getUserTokenBalance: function(tokenAddress) {
    
  }
}

