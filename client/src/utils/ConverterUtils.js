var RegistryUtils = require('./RegistryUtils');
const BancorConverterRegistry = require('../contracts/BancorConverterRegistry.json');
const BancorConverter = require('../contracts/BancorConverter');
const BancorNetwork = require('../contracts/BancorNetwork');
const ERC20Token = require('../contracts/ERC20Token.json');
const SwapActions = require('../actions/swap');

module.exports = {
  getConvertibleTokensInRegistry: function() {
    let web3 = window.web3;
    
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getConvertibleTokens().call()
      .then(function(data){
        return data;
      }).catch(function(err){
        throw err;
      })
      
    })
  },
  
  getReturnValueData: function(toAddress, fromAddress) {
        let web3 = window.web3;
        
        let ConverterContract = new web3.eth.Contract(BancorConverter, toAddress);
        
        return ConverterContract.methods.getReturn(toAddress, fromAddress, 100).call().then(function(dataResponse){
          return dataResponse;
        })
  },
  
  
  getPathTypesFromNetworkPath: function(networkPath) {
    const web3 = window.web3;
    
    
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
    
    let pathWithTypes = networkPath.map(function(pathCell){
      return converterRegistry.methods.isConvertibleToken(pathCell).call().then(function(pathTypeResponse){
        if (pathTypeResponse === true) {
          return {'type': 'convertibletoken', address: pathCell};
        } else {
          return converterRegistry.methods.isSmartToken(pathCell).call().then(function(pathTypeResponse){
            if (pathTypeResponse === true) {
              
              return {type: 'smarttoken', address: pathCell}
            } else {
              return {type: 'unknown', address: pathCell}
            }
          });
        }
      })
    });
    
    return Promise.all(pathWithTypes).then(function(pathTypeResponse){
      let responseData = networkPath.map(function(pc){
        let pathWithtype = pathTypeResponse.find((i)=>(i.address === pc));
        return pathWithtype;
      });
      return responseData;
      
    })
    
    });
  },
  
  getNetworkPathMeta: function(path) {
    const web3 = window.web3;
    let pathData = path.map(function(item){
      var erc20Contract = new web3.eth.Contract(ERC20Token, item);
      return erc20Contract.methods.name().call().then(function(tokenName){
        return erc20Contract.methods.symbol().call().then(function(tokenSymbol){
          return {name: tokenName, symbol: tokenSymbol, address: item};
        })
      })
    });
    
    return Promise.all(pathData).then(function(pathDataResponse){
      let pathWithData = path.map(function(pathCell){
        let itemMeta = pathDataResponse.find((i)=>(i.address === pathCell));
        return {'address': pathCell, 'meta': itemMeta};
      })
      return pathWithData;
    });
    
  },
  
  getExpectedReturn: function(path, amount) {
    const web3 = window.web3;
    
    return RegistryUtils.getContractAddress('BancorNetwork').then(function(bnAddress){
      const bancorNetworkContract = new web3.eth.Contract(BancorNetwork, bnAddress);
      return bancorNetworkContract.methods.getReturnByPath(path, amount).call().then(function(pathDataResponse){
        return pathDataResponse;
      });
    });
  },
  
  getBalanceOfToken(tokenAddress, isEth) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;
    
    if (!isEth) {
      const erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
      return erc20Contract.methods.balanceOf(senderAddress).call().then(function(addressBalanceResponse){
        return addressBalanceResponse;
      });
    } else {
      return new Promise((resolve, reject) => {
        web3.eth.getBalance(senderAddress, function(err, response){
          if (err) {
            reject(err);
          }
          resolve(response);
        })
      })
    }
      
  },
  submitSwapToken(path, amount, fromAddress, isEth) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;
    const affiliate_account_address = '0x0000000000000000000000000000000000000000';
    const affiliate_fee = '0';

    
    return RegistryUtils.getContractAddress('BancorNetwork').then(function(bnAddress){
      const bancorNetworkContract = new web3.eth.Contract(BancorNetwork, bnAddress);
      if (isEth) {
      return bancorNetworkContract.methods.convert2(path, amount, 1, affiliate_account_address, affiliate_fee)
        .send({
          'from': senderAddress,
          value: amount
        }).then(function(pathDataResponse){

          return pathDataResponse;
        }).catch(function(err){

        });
      } else {
        let erc20Contract = new web3.eth.Contract(ERC20Token, fromAddress);
        return erc20Contract.methods.approve(bnAddress, amount).send({
                 'from': senderAddress,
        }).then(function(approveResponse){
          return bancorNetworkContract.methods.claimAndConvert2(path, amount, 1, affiliate_account_address, affiliate_fee)
            .send({
              'from': senderAddress,
              value: undefined
            }).catch(function(err){
              // Handle error
            }).then(function(pathDataResponse){
              return pathDataResponse;
            }).catch(function(err){
      
      
            });   
        }) 
      }
    });
    
    
  }
  
}