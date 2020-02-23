var {getContractAddress}= require('./RegistryUtils');

const ContractRegistryAddress = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY;
const bancor = require('./bancor/index.ts');
const EthereumNodeEndpoint = "";

module.exports = {
  getBancorConversionRate: function(from, to, fromAmount) {
    const sourceToken = {
    blockchainType: 'ethereum',
    blockchainId: from
  };
  const targetToken = {
      blockchainType: 'ethereum',
      blockchainId: to
  };
  
  return getBancorInstance().then(function(bn){
    let fromAmountString = fromAmount.toString();
    return bancor.getRate(sourceToken, targetToken, fromAmountString).then(function(dataResponse){
      return dataResponse;
      })
  })
  }
}

async function getBancorInstance() {

  await bancor.init({
    'web3': window.web3,
    'ethereumContractRegistryAddress': ContractRegistryAddress
  });


  
}