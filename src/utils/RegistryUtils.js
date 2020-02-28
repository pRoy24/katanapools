
const ContractRegistry = require('../contracts/ContractRegistry.json');

const BancorConverterRegistry = require('../contracts/BancorConverterRegistry.json');

const ERC20Token = require('../contracts/ERC20Token.json');

const BancorNetworkPathFinder = require('../contracts/BancorNetworkPathFinder.json');

const BancorConverter = require('../contracts/BancorConverter.json');

const axios = require('axios');

module.exports = {
  getConverterRegistryAddress: function() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    let CONTRACT_REGISTRY_ADDRESS = getContractRegistry();
    let converterRegistry = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    return converterRegistry.methods
      .addressOf(web3.utils.utf8ToHex("BancorConverterRegistry")).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  },
  
  
  getTokenList: function(registryAddress, tokenFetchFlag) {
    const web3 = window.web3;
    var BancorConverterRegistryContract = new web3.eth.Contract(BancorConverterRegistry, registryAddress)
    
    if (tokenFetchFlag === 'alltokens') {
      return BancorConverterRegistryContract.methods.getConvertibleTokens().call().then(function(convertibleTokenList){
        return  BancorConverterRegistryContract.methods.getSmartTokens().call().then(function(smartTokenList){
          return convertibleTokenList.concat(smartTokenList);
        });
      });
    } else if (tokenFetchFlag === 'smarttokens') {
        return  BancorConverterRegistryContract.methods.getSmartTokens().call().then(function(smartTokenList){
        return smartTokenList;
      });      
    } else if (tokenFetchFlag === 'convertibletokens') {
      return BancorConverterRegistryContract.methods.getConvertibleTokens().call().then(function(convertibleTokenList){
        return convertibleTokenList;
      });      
    } else {
      return new Promise((resolve, reject) => {
        resolve([]);
      })
    }
  },
  
  getConvertibleTokenList: function( converterRegistryAddress) {
        const web3 = window.web3;
    var BancorConverterRegistryContract = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress)
    
    return BancorConverterRegistryContract.methods.getConvertibleTokens().call().then(function(convertibleTokenList){
      return convertibleTokenList;
    });
  },
  
  getTokenData: function(tokenList) {
    const web3 = window.web3;
    
    let convertibleTokenDataList = tokenList.map(function(tokenAddress){
      return fetchTokenMeta(tokenAddress);
    });

  return Promise.all(convertibleTokenDataList).then(function(dataResponse){
    let filteredDataResponse = dataResponse.filter(Boolean);
    return filteredDataResponse;
  })
    
  },
  
  
  getTokenDetails: function(tokenAddress) {

  return fetchTokenMeta(tokenAddress);
    
  },
  
  getNetworkPathContractAddress: function() {
    const web3 = window.web3;
    const CONTRACT_REGISTRY_ADDRESS = getContractRegistry();
    let converterRegistry = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    
    return converterRegistry.methods
      .addressOf(web3.utils.utf8ToHex("BancorNetworkPathFinder")).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  },
  
  
  
  getNetworkPath: function( from, to, networkPathContractAddress) {
    const web3 = window.web3;
    var BancorConverterRegistryContract = new web3.eth.Contract(BancorNetworkPathFinder, networkPathContractAddress)
    return BancorConverterRegistryContract.methods.generatePath(from, to).call().then(function(convertibleTokenList){
      return convertibleTokenList;
    });
  },
  
  
  getContractAddress: function(contractName) {
    const web3 = window.web3;
    const CONTRACT_REGISTRY_ADDRESS = getContractRegistry();
    
    let converterRegistry = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    
    return converterRegistry.methods
      .addressOf(web3.utils.utf8ToHex(contractName)).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  },
  
  getConverterValue: function(pathAddress, from, to, amount) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverter, pathAddress);
    
    return converterRegistry.methods.getReturn(from, to, amount).call().then(function(dataRes){
      console.log(dataRes);
      return dataRes;
    })
  },
  
  
  getLiquidityPools: function(contractAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, contractAddress);
    return converterRegistry.methods.getLiquidityPools().call().then(function(poolData){
        return poolData;
      });    
  },
  
  
  getSmartTokens: function(contractAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, contractAddress);
    return converterRegistry.methods.getSmartTokens().call().then(function(smartData){
        return smartData;
      });      
  },
  
  getERC20DData: function(contractAddress) {
    const web3 = window.web3;

    let erc20Contract = new web3.eth.Contract(ERC20Token, contractAddress);

    return erc20Contract.methods.symbol().call().then(function(symbol){
      return erc20Contract.methods.name().call().then(function(name){
        return erc20Contract.methods.decimals().call().then(function(decimals){
          return {'name': name, 'symbol': symbol, 'decimals': decimals, 'address': contractAddress};
         });
        });
      });      
  },
  
  getConverterReserveTokenCount: function(contractAddress) {
    const web3 = window.web3;
    

    
    let converterContract = new web3.eth.Contract(BancorConverter, contractAddress);

   return converterContract.methods.reserveTokenCount().call().then(function(data){
   
      return data;
    })
  },
  
  
  getConverterAddressList: function(converterRegistryAddress, smartTokenAddressList) {
  
      const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);

    return converterRegistry.methods.getConvertersBySmartTokens(smartTokenAddressList).call().then(function(symbol){
        return symbol;
      });     

  
    
  },
  
  
  getConvertibleTokenSmartTokens: function(converterRegistryAddress, smartTokenAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);
    return converterRegistry.methods.getConvertibleTokenSmartTokens(smartTokenAddress).call().then(function(smartData){
        return smartData;
      });   
  },
  

}

function fetchTokenMeta(tokenAddress) {
      const web3 = window.web3;
    
    let CurrentToken = new web3.eth.Contract(ERC20Token, tokenAddress);
    return CurrentToken.methods.name().call().then(function(tokenName){
      return CurrentToken.methods.decimals().call().then(function(tokenDecimals){
        return CurrentToken.methods.symbol().call().then(function(tokenSymbol){
          return CurrentToken.methods.totalSupply().call().then(function(totalSupply){
            
      
          return axios.get(`https://api.bancor.network/0.1/currencies/${tokenSymbol}`).then(function(tokenApiMeta){

            const imgFile = tokenApiMeta.data.data.primaryCommunityImageName || "";
            const [name, ext] = imgFile.split(".");
            let imgURI = `https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/${name}_200w.${ext}`;
  
            return Object.assign({}, {name: tokenName, symbol: tokenSymbol, address: tokenAddress,totalSupply: totalSupply,
                                decimals: tokenDecimals, imageURI: imgURI, meta: tokenApiMeta.data.data});
          }).catch(function(err){
                        return Object.assign({}, {name: tokenName, symbol: tokenSymbol, address: tokenAddress, totalSupply: totalSupply,
                                decimals: tokenDecimals, imageURI: 'https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/f80f2a40-eaf5-11e7-9b5e-179c6e04aa7c_200w.png'
                                , meta: {}});
          })
          })
        })
      });
    }).catch(function(err){
          return null;
        });
}

function getContractRegistry() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    let CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;

    if (currentNetwork.toString() === '3') {
      CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;
    }
    return CONTRACT_REGISTRY_ADDRESS;
}

function getBNTAddress() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    
    let BNT_ADDRESS = process.env.REACT_APP_BNT_ID_MAINNET;
    
    if (currentNetwork.toString() === '3') {
      BNT_ADDRESS = process.env.REACT_APP_BNT_ID_ROPSTEN;
    }
    return BNT_ADDRESS;  
}