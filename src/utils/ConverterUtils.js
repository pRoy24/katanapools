import {toDecimals, fromDecimals} from './eth';
var RegistryUtils = require('./RegistryUtils');
const BancorConverterRegistry = require('../contracts/BancorConverterRegistry.json');
const BancorConverter = require('../contracts/BancorConverter');
const BancorNetwork = require('../contracts/BancorNetwork');
const ERC20Token = require('../contracts/ERC20Token.json');
const BancorForumla = require('../contracts/BancorFormula.json');
const Decimal = require('decimal.js');

  export function getConvertibleTokensInRegistry() {
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
  }

  export function getSmartTokensInRegistry() {
    let web3 = window.web3;
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getSmartTokens().call()
      .then(function(data){
        return data;
      }).catch(function(err){
        throw err;
      })

    })
  }

  export function getSmartTokensWithSymbolsInRegistry() {
    let web3 = window.web3;
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getSmartTokens().call()
      .then(function(data){
        return Promise.all(fetchTokenListSymbolAndName(data)).then(function(tokenData){
          return tokenData;
        })

      }).catch(function(err){
        throw err;
      })

    })
  }

  export function multiCallTokenData(tokenList) {
    return resolveTokenListNameAndSymbol(tokenList).then(function(dataResponse){
      return getTokenListMeta(dataResponse).then(function(tokenListDetails){
        return tokenListDetails;
      });
    })
  }

  export function getReserveTokenNameAndSymbol(address) {
    return fetchTokenSymbolAndName(address).then(function(response){
      return response;
    })
  }
  export function getReturnValueData(toAddress, fromAddress) {
        let web3 = window.web3;
        let ConverterContract = new web3.eth.Contract(BancorConverter, toAddress);
        return ConverterContract.methods.getReturn(toAddress, fromAddress, 100).call().then(function(dataResponse){
          return dataResponse;
        })
  }

  export function getPathTypesFromNetworkPath(networkPath) {
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
  }

  export function getNetworkPathMeta(path) {
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

  }

  export function getExpectedReturn(path, amount, initialBase, baseReserveAmount, counter = 1, offset = 0.5) {
    return getPathReturnValue(path, baseReserveAmount).then(function(pathDataResponse){
      let pathAmount = pathDataResponse[0];
      const pathAmountDisplay = fromDecimals(pathAmount, 18);
      const pathAmountDecimals = new Decimal(pathAmountDisplay);
      const amountDecimals = new Decimal(amount);

      if (pathAmountDecimals.greaterThanOrEqualTo(amountDecimals)) {
        return {'base': baseReserveAmount, 'reserve': pathAmount};;
      } else {

        if (counter % 5 === 0) {
          offset = offset * 2;
        } 
        let newAmount = new Decimal(initialBase).add(offset).toString();
        let newAmountDisplay = toDecimals(newAmount, 18);

        return getExpectedReturn(path, amount, newAmount, newAmountDisplay, counter + 1, offset);
      }
    });
  }
  
  function getOffsetValue(baseAmountNum) {
    let offset;
    if (baseAmountNum.lessThanOrEqualTo(10)) {
      offset = 0.5;
    } else if (baseAmountNum.greaterThan(10) && baseAmountNum.lessThanOrEqualTo(100)) {
      offset = 0.5;
    } else if (baseAmountNum.greaterThan(100) && baseAmountNum.lessThanOrEqualTo(1000)){
      offset = 5;
    } else if (baseAmountNum.greaterThan(1000) && baseAmountNum.lessThanOrEqualTo(10000)) {
      offset = 50;
    } else {
      offset = 100;
    }
    return offset;
  }
  
  function getPathReturnValue(path, baseReserveAmountMin) {
    const web3 = window.web3;
    return RegistryUtils.getContractAddress('BancorNetwork').then(function(bnAddress){
      const bancorNetworkContract = new web3.eth.Contract(BancorNetwork, bnAddress);
      return bancorNetworkContract.methods.getReturnByPath(path, baseReserveAmountMin).call().then(function(pathDataResponse){
        return pathDataResponse;
      });
    });
    
  }
  // Returns the balance of token if ERC20 and balance of Ethereum + balance of ethereum deposited into Ether token if Ether
  export function getFullBalanceOfToken(tokenAddress, isEth) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;
    if (senderAddress === undefined || senderAddress === null) {
      return new Promise((resolve)=>(resolve('0')));
    }
    if (!isEth) {
      let erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
      return erc20Contract.methods.balanceOf(senderAddress).call().then(function(addressBalanceResponse){
        return addressBalanceResponse;
      });
    } else {
      // get balance of Ether already deposited into the Ether contract
      let erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
      return erc20Contract.methods.balanceOf(senderAddress).call().then(function(addressBalanceResponse){
      return new Promise((resolve, reject) => {
        // Get coinbase Ether balance
        web3.eth.getBalance(senderAddress, function(err, etherBalance){
          if (err) {
            reject(err);
          }
          let totalBalance = Decimal(etherBalance).plus(Decimal(addressBalanceResponse));
          totalBalance = totalBalance.toString();
          resolve(totalBalance);
        });
        })
      })
    }
  }

   export function  getBalanceOfToken(tokenAddress, isEth) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;

    if (senderAddress === undefined || senderAddress === null) {
      return new Promise((resolve)=>(resolve('0')));
    }
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
  };
  
  export function getAllowanceOfToken(tokenAddress, spenderAddress) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;

    if (senderAddress === undefined || senderAddress === null) {
      return new Promise((resolve)=>(resolve('0')));
    }
      const erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
      return erc20Contract.methods.allowance(senderAddress, spenderAddress).call().then(function(addressAllowanceResponse){
        return addressAllowanceResponse;
      });
  }
  
  export function setTokenAllowance(tokenAddress, spenderAddress, decimals, amount) {
    const web3 = window.web3;
    amount = toDecimals(amount, decimals);
    const owner = web3.currentProvider.selectedAddress;
    if (owner === undefined || owner === null) {
      return new Promise((resolve)=>(resolve('0')));
    }

  const contract = new web3.eth.Contract(ERC20Token, tokenAddress);
  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spenderAddress).call().then(function(allowance) {
    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = allowance;

    const amountAllowed = new Decimal(minAllowance);
    const amountNeeded = new Decimal(minAmount);

    if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isPositive() && !amountAllowed.isZero()) {

    return contract.methods.approve(web3.utils.toChecksumAddress(spenderAddress), 0).send({
      from: owner
    }).then(function(approveResetResponse){

    return contract.methods.approve(web3.utils.toChecksumAddress(spenderAddress), amount).send({
       from: owner
    }, function(err, txHash){

    }).then(function(allowanceResponse){

      return allowanceResponse;
    })
    });
    } else if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isZero()) {
        return contract.methods.approve(web3.utils.toChecksumAddress(spenderAddress), amount).send({
           from: owner
        }, function(err, txHash){

        }).then(function(allowanceResponse){

          return allowanceResponse;
        })
    } else {
      return null;
    }
  });
  });
  }
  
  
  export function revokeTokenAllowance(tokenAddress, spenderAddress) {
    const web3 = window.web3;
    const owner = web3.currentProvider.selectedAddress;  
    const contract = new web3.eth.Contract(ERC20Token, tokenAddress);
    return contract.methods.approve(web3.utils.toChecksumAddress(spenderAddress), 0).send({
      from: owner
    }).then(function(approveResetResponse){
      return approveResetResponse;
    });    
  }

  export function getDecimalsOfToken(tokenAddress) {
      const web3 = window.web3;
      const erc20Contract = new web3.eth.Contract(ERC20Token, tokenAddress);
      return erc20Contract.methods.decimals().call().then(function(decimals){
        return decimals;
      })
  }

  export function  submitSwapToken(path, amount, fromAddress, isEth) {
    const web3 = window.web3;
    const senderAddress = web3.currentProvider.selectedAddress;
    const currentNetwork = web3.currentProvider.networkVersion;
    let affiliate_account_address = '0xaC98a5eFfaEB7A0578E93cF207ceD12866092947';
    const affiliate_fee = '3000';

    if (currentNetwork === '3') {
      affiliate_account_address = '0x1335E0750d74B21A837cCBD4D1a7e30699001848';
    }

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

        return getApprovalBasedOnAllowance(erc20Contract, bnAddress, amount).then(function(approvalResponse){

          return bancorNetworkContract.methods.claimAndConvert2(path, amount, 1, affiliate_account_address, affiliate_fee)
            .send({
              'from': senderAddress,
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

  export function getConvertibleTokensBySmartTokens() {
    // {address: '', reserves: []}
    let smartTokenList = [];
    return getConvertibleToSmartTokenMapping().then(function(dataResponse){
      dataResponse.forEach(function(dataItem){
        dataItem.smartTokens.forEach(function(smartToken){
          let tokenFoundIndex = smartTokenList.findIndex(function(existing){
            return existing.address === smartToken;
          })
          if (tokenFoundIndex !== -1) {
            smartTokenList[tokenFoundIndex].reserves.push(dataItem.convertibleToken);
          } else {
            smartTokenList.push({address: smartToken, reserves: [dataItem.convertibleToken]})
          }
        })
      });
      return smartTokenList;
    })
  }


export function getTokenConversionPath(fromToken, toToken) {
  return RegistryUtils.getNetworkPathContractAddress().then(function(networkPathGenerator){
    return RegistryUtils.getNetworkPath(fromToken.address, toToken.address, networkPathGenerator).then(function(networkPath){
        return networkPath;
      })
    })
}
export function getTokenFundConversionAmount(tokenPath, amount, baseReserveAmount) {
 let baseAmountDecimals = toDecimals(baseReserveAmount, 18);
  let baseAmountNum = new Decimal(baseReserveAmount);
  const offset = getOffsetValue(baseAmountNum);
  return getExpectedReturn(tokenPath, amount, baseReserveAmount, baseAmountDecimals, 1, offset).then(function(totalAmount){
    return totalAmount;
  });
}

export function getTokenWithdrawConversionAmount(tokenPath, amount) {
  return getPathReturnValue(tokenPath, amount).then(function(response){
    return new Decimal(response[0]);
  })
}



export function getFundAmount(supply, reserveBalance, ratio, amount) {
  const web3 = window.web3;
  return RegistryUtils.getContractAddress("BancorFormula").then(function(formulaAddress){
    const FormulaContract = new web3.eth.Contract(BancorForumla, formulaAddress);
   return FormulaContract.methods.calculateFundCost(supply, reserveBalance, ratio, amount).call().then(function(response){
     return response;
   })
  })  
}

export function getLiquidateAmount(supply, reserveBalance, ratio, amount) {
  const web3 = window.web3;
  return RegistryUtils.getContractAddress("BancorFormula").then(function(formulaAddress){
    const FormulaContract = new web3.eth.Contract(BancorForumla, formulaAddress);
    return FormulaContract.methods.calculateLiquidateReturn(supply, reserveBalance, ratio, amount).call().then(function(response){
      return response;
    })
  });  
}

function getConvertibleToSmartTokensMap() {
      let web3 = window.web3;

    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getConvertibleTokens().call()
      .then(function(convertibleTokenList){
        return convertibleTokenList.map(function(convertibleToken){
          return converterRegistry.methods.getConvertibleTokenSmartTokens(convertibleToken).call()
          .then(function(smartTokensForConverter){
            return {'convertibleToken': convertibleToken, smartTokens: smartTokensForConverter }
          })
        })

      }).catch(function(err){
        throw err;
      })

    })
}


function getConvertibleToSmartTokenMapping() {
  return new Promise((resolve, reject)=>{
    getConvertibleToSmartTokensMap().then(function(data){
      Promise.all(data).then(function(response){
        resolve(response);
      });
    })
  })
}

function fetchTokenListSymbolAndName(dataList) {
  const web3 = window.web3;
  return dataList.map(function(tokenAddress){
    let CurrentToken = new web3.eth.Contract(ERC20Token, tokenAddress);
        return CurrentToken.methods.symbol().call().then(function(tokenSymbol){
          return CurrentToken.methods.name().call().then(function(tokenName){
              return Object.assign({}, {symbol: tokenSymbol, address: tokenAddress, name: tokenName});
          });
        })
  })
}

function fetchTokenSymbolAndName(address) {
  const web3 = window.web3;
  try {
  let CurrentToken = new web3.eth.Contract(ERC20Token, address);
  return CurrentToken.methods.symbol().call().then(function(tokenSymbol){
    return CurrentToken.methods.name().call().then(function(tokenName){
      return Object.assign({}, {symbol: tokenSymbol, address: address, name: tokenName});
    });
  }).catch(function(err){
    throw err;
  });
  } catch(e) {
    return new Promise((resolve, reject)=>(reject(e)));
  }
}


// Promise based method to resolve token name and symbol
function resolveTokenListNameAndSymbol(tokenList) {
  const web3 = window.web3;

  let tokenListData = tokenList.map(function(address){
    const CurrentToken = new web3.eth.Contract(ERC20Token, address);
    return CurrentToken.methods.symbol().call().then(function(symbol){
      return CurrentToken.methods.name().call().then(function(name){
        return {'name': name, 'symbol': symbol, 'address': address};
      })
    }).catch(function(err){
      return null;
    })
  });

  return Promise.all(tokenListData).then(function(dataResponse){
    return dataResponse.filter(Boolean);
  })
}


function getTokenListMeta(tokenList) {
  let tokenListPromises = tokenList.map(function(item){
    return new Promise((resolve, reject) => resolve( Object.assign({}, item, {imageURI: 'https://storage.googleapis.com/bancor-prod-file-store/images/communities/cache/f80f2a40-eaf5-11e7-9b5e-179c6e04aa7c_200w.png'})))
  });
  return Promise.all(tokenListPromises).then(function(dataResponse){
    return dataResponse;
  })
}

function getApprovalBasedOnAllowance(contract, spender, amount) {
  const web3 = window.web3;
  const owner = web3.currentProvider.selectedAddress;

  return contract.methods.decimals().call().then(function(amountDecimals){
  return contract.methods.allowance(owner, spender).call().then(function(allowance) {

    if (!allowance || typeof allowance === undefined) {
      allowance = 0;
    }
    let minAmount = amount;
    let minAllowance = allowance;


    const amountAllowed = new Decimal(minAllowance);
    const amountNeeded = new Decimal(minAmount);


    if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isPositive() && !amountAllowed.isZero()) {

    return contract.methods.approve(web3.utils.toChecksumAddress(spender), 0).send({
      from: owner
    }).then(function(approveResetResponse){

    return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
       from: owner
    }, function(err, txHash){

    }).then(function(allowanceResponse){

      return allowanceResponse;
    })
    });
    } else if (amountNeeded.greaterThan(amountAllowed) &&  amountAllowed.isZero()) {

        return contract.methods.approve(web3.utils.toChecksumAddress(spender), amount).send({
           from: owner
        }, function(err, txHash){

        }).then(function(allowanceResponse){

          return allowanceResponse;
        })
    } else {
      return null;
    }
  });
  });
}