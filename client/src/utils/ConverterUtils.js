var RegistryUtils = require('./RegistryUtils');
const BancorConverterRegistry = require('../contracts/BancorConverterRegistry.json');
const BancorConverter = require('../contracts/BancorConverter');

module.exports = {
  getConvertibleTokensInRegistry: function() {
    let web3 = window.web3;
    
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getConvertibleTokens().call()
      .then(function(data){
        return data;
      }).catch(function(err){
        console.log(err);
        throw err;
      })
      
    })
  },
  
  
  getReturnValueData: function(toAddress, fromAddress) {
        let web3 = window.web3;
        
        let ConverterContract = new web3.eth.Contract(BancorConverter, toAddress);
        
        return ConverterContract.methods.getReturn(toAddress, fromAddress, 100).call().then(function(dataResponse){
          console.log(dataResponse);
          return dataResponse;
          
        })
        
  }
}