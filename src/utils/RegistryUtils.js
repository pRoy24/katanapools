
const ContractRegistry = require('../contracts/ContractRegistry.json');

const BancorConverterRegistry = require('../contracts/ConverterRegistry.json');

const ERC20Token = require('../contracts/ERC20Token.json');

const BancorNetworkPathFinder = require('../contracts/ConversionPathFinder.json');

const BancorConverter = require('../contracts/LiquidityPoolV1Converter.json');

const axios = require('axios');


 export function getConverterRegistryAddress() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    let CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;
    if (currentNetwork && currentNetwork.toString() === '3') {
      CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;
    }
    let ContractRegistryContract = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    return ContractRegistryContract.methods
      .addressOf(web3.utils.utf8ToHex("BancorConverterRegistry")).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  }
  
  
   export function getTokenList(registryAddress, tokenFetchFlag) {
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
  }
  
  export function getConvertibleTokenList( converterRegistryAddress) {
        const web3 = window.web3;
    var BancorConverterRegistryContract = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress)
    
    return BancorConverterRegistryContract.methods.getConvertibleTokens().call().then(function(convertibleTokenList){
      return convertibleTokenList;
    });
  }
  
  export function getTokenData(tokenList) {

    let convertibleTokenDataList = tokenList.map(function(tokenAddress){
      return fetchTokenMeta(tokenAddress);
    });

  return Promise.all(convertibleTokenDataList).then(function(dataResponse){
    let filteredDataResponse = dataResponse.filter(Boolean);
    return filteredDataResponse;
  })
    
  }
  
  
  export function getTokenDetails(tokenAddress) {

    return fetchTokenMeta(tokenAddress);
  }
  
  export function getTokenLightDetails(tokenAddress) {
    return fetchTokenLightData(tokenAddress);
  }
  
  export function getNetworkPathContractAddress() {
    const web3 = window.web3;
    const currentNetwork = web3.currentProvider.networkVersion;
    let CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;
    if (currentNetwork && currentNetwork.toString() === '3') {
      CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;
    }
    let converterRegistry = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    
    return converterRegistry.methods
      .addressOf(web3.utils.utf8ToHex("BancorNetworkPathFinder")).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  }
  
  
  
  export function getNetworkPath( from, to, networkPathContractAddress) {
    const web3 = window.web3;
    var BancorConverterRegistryContract = new web3.eth.Contract(BancorNetworkPathFinder, networkPathContractAddress)
    return BancorConverterRegistryContract.methods.generatePath(from, to).call().then(function(convertibleTokenList){
      return convertibleTokenList;
    });
  }
  
  
  export function getContractAddress(contractName) {
    const web3 = window.web3;
    console.log(web3);
    const currentNetwork = web3.currentProvider.networkVersion;
    let CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;
    if (currentNetwork && currentNetwork.toString() === '3') {
      CONTRACT_REGISTRY_ADDRESS = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;
    }

    let converterRegistry = new web3.eth.Contract(ContractRegistry, CONTRACT_REGISTRY_ADDRESS);
    
    return converterRegistry.methods
      .addressOf(web3.utils.utf8ToHex(contractName)).call().then(function(converterRegistryAddress){
        return converterRegistryAddress;
      });
  }
  
  export function getConverterValue(pathAddress, from, to, amount) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverter, pathAddress);
    
    return converterRegistry.methods.getReturn(from, to, amount).call().then(function(dataRes){
      console.log(dataRes);
      return dataRes;
    })
  }
  
  
  export function getLiquidityPools(contractAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, contractAddress);
    return converterRegistry.methods.getLiquidityPools().call().then(function(poolData){
        return poolData;
      });    
  }
  
  
  export function getSmartTokens(contractAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, contractAddress);
    return converterRegistry.methods.getSmartTokens().call().then(function(smartData){
        return smartData;
      });      
  }
  
   export function getERC20DData(contractAddress) {
    const web3 = window.web3;

    let erc20Contract = new web3.eth.Contract(ERC20Token, contractAddress);

    return erc20Contract.methods.symbol().call().then(function(symbol){
      return erc20Contract.methods.name().call().then(function(name){
        return erc20Contract.methods.decimals().call().then(function(decimals){
          return {'name': name, 'symbol': symbol, 'decimals': decimals, 'address': contractAddress};
         });
        });
      });      
  }
  
   export function getConverterReserveTokenCount(contractAddress) {
    const web3 = window.web3;
    
    let converterContract = new web3.eth.Contract(BancorConverter, contractAddress);

   return converterContract.methods.reserveTokenCount().call().then(function(data){
   
      return data;
    })
  }
  
  
  export function getConverterAddressList(converterRegistryAddress, smartTokenAddressList) {
  
      const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);

    return converterRegistry.methods.getConvertersBySmartTokens(smartTokenAddressList).call().then(function(converters){
        return converters;
      });     
  }
  
  
  export function getConvertibleTokenSmartTokens(converterRegistryAddress, smartTokenAddress) {
    const web3 = window.web3;
    let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);
    return converterRegistry.methods.getConvertibleTokenSmartTokens(smartTokenAddress).call().then(function(smartData){
        return smartData;
      });   
  }
  


function fetchTokenMeta(tokenAddress) {
      const web3 = window.web3;
    
    let CurrentToken = new web3.eth.Contract(ERC20Token, tokenAddress);
        return CurrentToken.methods.symbol().call().then(function(tokenSymbol){
          return CurrentToken.methods.totalSupply().call().then(function(totalSupply){
            return CurrentToken.methods.name().call().then(function(tokenName){
            return CurrentToken.methods.decimals().call().then(function(tokenDecimals){
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


function fetchTokenLightData(tokenAddress) {
    const web3 = window.web3;
    let CurrentToken = new web3.eth.Contract(ERC20Token, tokenAddress);
    return CurrentToken.methods.symbol().call().then(function(tokenSymbol){
      return CurrentToken.methods.totalSupply().call().then(function(totalSupply){
        return CurrentToken.methods.name().call().then(function(tokenName){
        return CurrentToken.methods.decimals().call().then(function(tokenDecimals){
       return Object.assign({}, {name: tokenName, symbol: tokenSymbol, address: tokenAddress, totalSupply: totalSupply,
                            decimals: tokenDecimals});   
        });
      });
    });
});
}