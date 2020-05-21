import {getConvertibleTokensBySmartTokens} from './ConverterUtils';

export function getAllPathsWithRates(sourceToken, targetToken, amount = 2) {
    
    getConvertibleTokensBySmartTokens().then(function(map){
      //  console.log(map);
    })
    
    return new Promise((resolve, reject) => (resolve()));       
}


export function getAllConvertibleTokens() {
    
}


export function getGraph() {

}