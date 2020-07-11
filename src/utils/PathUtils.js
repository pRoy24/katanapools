import {getConvertibleTokensBySmartTokens} from './ConverterUtils';
import axios from 'axios';

export function getAllPathsWithRates(sourceToken, targetToken, amount = 2) {
    
    getConvertibleTokensBySmartTokens().then(function(map){
      //  console.log(map);
    })
    
    return new Promise((resolve, reject) => (resolve()));       
}


export function getGasPrice(txType = "avg") {
  axios.get(`https://ethgasstation.info/api/ethgasAPI.json`).then(function(response){
    
  })
}

export function getAllConvertibleTokens() {
    
}


export function getGraph() {

}