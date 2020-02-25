/* eslint-disable max-len */
/* eslint-disable no-sync */
/* eslint-disable prefer-reflect */
import Web3 from 'web3';
import { BancorConverterV9 } from './contracts/BancorConverterV9';
import { fromWei, toWei } from './utils';
import { ConversionPathStep, Token } from '../../path_generation';
import { BancorConverter } from './contracts/BancorConverter';
import { ContractRegistry } from './contracts/ContractRegistry';
import { BancorConverterRegistry } from './contracts/BancorConverterRegistry';
import { SmartToken } from './contracts/SmartToken';
import { ERC20Token } from './contracts/ERC20Token';

const MULTICALL_ADDRESS = process.env.REACT_APP_MULTICALL_ADDRESS;
const BANCOR_CONTRACT_REGISTRY = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY;

const ETHBlockchainId = process.env.REACT_APP_ETHER_ID;
const BNTBlockchainId = process.env.REACT_APP_BNT_ID;
let web3;
let bancorConverter = BancorConverter;
let contractRegistry = ContractRegistry;
let registryAbi = BancorConverterRegistry;
let registry;

export async function init(web3Instance, ethereumContractRegistryAddress = BANCOR_CONTRACT_REGISTRY) {
    web3 = web3Instance;
    const contractRegistryContract = new web3.eth.Contract(contractRegistry, ethereumContractRegistryAddress);
   // const registryBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call(); 
    
   return contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call().then(function(registryBlockchainId){
         registry = new web3.eth.Contract(registryAbi, registryBlockchainId);
         return registry;
    });
}

export const getAmountInTokenWei = async (token: string, amount: string, web3) => {
    const tokenContract = new web3.eth.Contract(ERC20Token, token);
    const decimals = await tokenContract.methods.decimals().call();
    return toWei(amount, decimals);
};

export const getConversionReturn = async (converterPair: ConversionPathStep, amount: string, ABI, web3) => {
    
    console.log("Converter pair ");
    console.log(converterPair);
    
    console.log(amount);
    
    let converterContract = new web3.eth.Contract(ABI, converterPair.converterBlockchainId);
    const returnAmount = await converterContract.methods.getReturn(converterPair.fromToken, converterPair.toToken, amount).call();
    return returnAmount;
};

export const getTokenDecimals = async tokenBlockchainId => {
    const token = new web3.eth.Contract(ERC20Token, tokenBlockchainId);
    return await token.methods.decimals().call();
};

export async function getPathStepRate(converterPair: ConversionPathStep, amount: string) {
    let amountInTokenWei = await getAmountInTokenWei((converterPair.fromToken as string), amount, web3);
    const tokenBlockchainId = converterPair.toToken;
    const tokenDecimals = await getTokenDecimals(tokenBlockchainId);
    try {
        const returnAmount = await getConversionReturn(converterPair, amountInTokenWei, bancorConverter, web3);
        amountInTokenWei = returnAmount['0'];
    }
    catch (e) {
        if (e.message.includes('insufficient data for uint256'))
            amountInTokenWei = await getConversionReturn(converterPair, amountInTokenWei, BancorConverterV9, web3);

        else throw (e);
    }
    return fromWei(amountInTokenWei, tokenDecimals);
}

export async function getRegistry() {
    const contractRegistryContract = new web3.eth.Contract(contractRegistry, BANCOR_CONTRACT_REGISTRY);
    const registryBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
    return new web3.eth.Contract(registryAbi, registryBlockchainId);
}

export const getConverterBlockchainId = async blockchainId => {
    const tokenContract = new web3.eth.Contract(SmartToken, blockchainId);
    return await tokenContract.methods.owner().call();
};

export function getSourceAndTargetTokens(srcToken: string, trgToken: string) {
    const isSourceETH = (srcToken || BNTBlockchainId).toLocaleLowerCase() == ETHBlockchainId.toLocaleLowerCase();
    const sourceToken = isSourceETH ? BNTBlockchainId : (srcToken || BNTBlockchainId);
    const targetToken = trgToken == ETHBlockchainId ? BNTBlockchainId : (trgToken || BNTBlockchainId);

    return {
        srcToken: sourceToken,
        trgToken: targetToken
    };
}

export async function getReserves(converterBlockchainId) {
    const reserves = new web3.eth.Contract(bancorConverter, converterBlockchainId);
    return { reserves };
}

export async function getReservesCount(reserves) {
    return await getTokenCount(reserves, 'connectorTokenCount');
}

export async function getReserveBlockchainId(converter, position) {
    const blockchainId = await converter.methods.connectorTokens(position).call();
    const returnValue: Token = {
        blockchainType: 'ethereum',
        blockchainId
    };

    return returnValue;
}

export async function getConverterSmartToken(converter) {
    return await converter.methods.token().call();
}

async function getTokenCount(converter: any, funcName: string) {
    let response = null;
    try {
        response = await converter.methods[funcName]().call();
        return response;
    }
    catch (error) {
        if (!error.message.startsWith('Invalid JSON RPC response')) {
            response = 0;
            return response;
        }
    }
}

export async function getReserveToken(converterContract, i) {
    const blockchainId = await converterContract.methods.connectorTokens(i).call();
    const token: Token = {
        blockchainType: 'ethereum',
        blockchainId
    };
    return token;
}

export async function getSmartTokens(token: Token) {
    const isSmartToken = await registry.methods.isSmartToken(token.blockchainId).call();
    const smartTokens = isSmartToken ? [token.blockchainId] : await registry.methods.getConvertibleTokenSmartTokens(token.blockchainId).call();
    return smartTokens;
}

function registryDataUpdate(registryData, key, value) {
    if (registryData[key] == undefined)
        registryData[key] = [value];
    else if (!registryData[key].includes(value))
        registryData[key].push(value);
}

function getAllPathsRecursive(paths, path, targetToken, registryData) {
    const prevToken = path[path.length - 1];

    if (prevToken == targetToken) {
        paths.push(path);
    }
    else 
    { 
        for (const nextToken of registryData[prevToken].filter(token => !path.includes(token))) {
            getAllPathsRecursive(paths, [...path, nextToken], targetToken, registryData);
        }
    }
}

export async function getAllPaths(sourceToken, targetToken) {
    const MULTICALL_ABI = [{"constant":false,"inputs":[{"components":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"internalType":"struct Multicall.Call[]","name":"calls","type":"tuple[]"},{"internalType":"bool","name":"strict","type":"bool"}],"name":"aggregate","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"components":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct Multicall.Return[]","name":"returnData","type":"tuple[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

    const multicall = new web3.eth.Contract(MULTICALL_ABI, MULTICALL_ADDRESS);

    const convertibleTokens = await registry.methods.getConvertibleTokens().call();
    const calls = convertibleTokens.map(convertibleToken => [registry._address, registry.methods.getConvertibleTokenSmartTokens(convertibleToken).encodeABI()]);
    const aggregateData = await multicall.methods.aggregate(calls, true).call();

    const blockNumber = aggregateData['blockNumber'];
    
    const returnData = aggregateData['returnData'];

    const registryData = {};

    for (let i = 0; i < returnData.length; i++) {
        for (const smartToken of Array.from(Array((returnData[i].data.length - 130) / 64).keys()).map(n => Web3.utils.toChecksumAddress(returnData[i].data.substr(64 * n + 154, 40)))) {
            if (convertibleTokens[i] != smartToken) {
                registryDataUpdate(registryData, convertibleTokens[i], smartToken);
                registryDataUpdate(registryData, smartToken, convertibleTokens[i]);
            }
        }
    }
    
    const paths = [];
    getAllPathsRecursive(paths, [sourceToken], targetToken, registryData);
    return paths;
}
