var RegistryUtils = require('./RegistryUtils');
const BancorConverterRegistry = require('../contracts/BancorConverterRegistry.json');
const BancorConverter = require('../contracts/BancorConverter');
const BancorNetwork = require('../contracts/BancorNetwork');
const ERC20Token = require('../contracts/ERC20Token.json');
const SwapActions = require('../actions/swap');

class Graph { 
    constructor(noOfVertices) 
    { 
        this.noOfVertices = noOfVertices; 
        this.AdjList = new Map(); 
        this.sourceDestPaths = [];
    } 

    addVertex(v) 
    { 
        this.AdjList.set(v, []); 
    } 
    
    addEdge(v, w) 
    { 
        this.AdjList.get(v).push(w); 
        this.AdjList.get(w).push(v); 
    } 
    
    printGraph() 
    { 
    	var get_keys = this.AdjList.keys(); 
    	for (var i of get_keys) 
      { 
    		var get_values = this.AdjList.get(i); 
    		var conc = ""; 
    		for (var j of get_values) 
    			conc += j + " "; 
    		console.log(i + " -> " + conc); 
    	} 
    }
  
  
  getPath(startingNode, endingNode) {
  	var visited = []; 
    	var get_keys = this.AdjList.keys(); 
    	for (var key of get_keys) 
      { 
  	    visited[key] = false;
  	  }
  	 visited[startingNode] = true;

    
    let allPathList = [];
    
    
  	this.GetPathDFSUtil(startingNode, endingNode,allPathList, visited); 
  	
  	console.log(this.sourceDestPaths);
  }
  
  GetPathDFSUtil(start, end, allPathList, visited) 
  { 
    allPathList.push(start);
    
    visited[start] = true;

    
    let get_neighbours = this.AdjList.get(start);

    for (var i in get_neighbours) { 
      var curr = get_neighbours[i]; 
      if (!visited[curr] && curr !== end) {
        this.GetPathDFSUtil(curr, end, allPathList, visited);
      } else if (curr === end){
        console.log("found end");
        allPathList.push(curr);
        console.log(allPathList);
    //   return;
        //this.sourceDestPaths.push(allPathList);
      }
    }
    visited[start] = false;
    
  }
  
} 


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
    
    
  },
  
  getConvertibleTokensBySmartTokens: function() {
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
  },
  
  fetchTokenPathsWithRates: function(fromToken, toToken) {
    
  },
  
  
  createTokenMap: function() {

      let web3 = window.web3;
    
    return RegistryUtils.getContractAddress('BancorConverterRegistry').then(function(registryAddress){
      let converterRegistry = new web3.eth.Contract(BancorConverterRegistry, registryAddress);
      return converterRegistry.methods.getConvertibleTokens().call()
      .then(function(convertibleTokenList){
        return converterRegistry.methods.getSmartTokens().call()
          .then(function(smartTokenList){
            let completeTokenList = convertibleTokenList.concat(smartTokenList);
            var graph = new Graph(completeTokenList.length);
            completeTokenList.forEach(function(item){
              graph.addVertex(item);
            });
            
            // add vertices
            let verexMap = completeTokenList.map(function(item){
              return converterRegistry.methods.getConvertibleTokenSmartTokens(item).call().then(function(data){
                data.forEach(function(smartToken){
                  graph.addEdge(item, smartToken);
                })
              })
            });
            
            return Promise.all(verexMap).then(function(mapRes){
              return graph;
            })
          })
      })
      
    });
    
  }
  
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