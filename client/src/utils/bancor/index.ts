import { init as initEthereum, getConverterBlockchainId, getPathStepRate as getEthPathStepRate, getAllPaths as ethereumGetAllPaths} from './blockchains/ethereum/index';

import { Token, generatePathByBlockchainIds, ConversionPaths, ConversionPathStep, BlockchainType, ConversionToken } from './path_generation';

interface Settings {
    ethereumNodeEndpoint: string;

    ethereumContractRegistryAddress?: string;
}

let web3;

export async function init(args: any) {
    web3 = args.web3;
    await initEthereum(args.web3, args.ethereumContractRegistryAddress);
}



export async function generatePath(sourceToken: Token, targetToken: Token) {
    return await generatePathByBlockchainIds(sourceToken, targetToken);
}

export const calculateRateFromPaths = async (paths: ConversionPaths, amount) => {
    if (paths.paths.length == 0) {
        console.log('inside empty');
        return amount;
    }
    const rate = await calculateRateFromPath(paths, amount);
    paths.paths.shift();
    return calculateRateFromPaths(paths, rate);
};

export async function calculateRateFromPath(paths: ConversionPaths, amount) {
    const blockchainType: BlockchainType = paths.paths[0].type;
    const convertPairs = await getConverterPairs(paths.paths[0].path, blockchainType);
    let i = 0;
    while (i < convertPairs.length) {
        amount = await getEthPathStepRate(convertPairs[i], amount);
        i += 1;
    }
    return amount;
}

async function getConverterPairs(path: string[] | object[], blockchainType: BlockchainType) {
    const pairs: ConversionPathStep[] = [];
    for (let i = 0; i < path.length - 1; i += 2) {
        let converterBlockchainId = blockchainType == 'ethereum' ? await getConverterBlockchainId(path[i + 1]) : path[i + 1];
        pairs.push({ converterBlockchainId: converterBlockchainId, fromToken: (path[i] as string), toToken: (path[i + 2] as string) });
    }

    return pairs;
}

export const getRateByPath = async (paths: ConversionPaths, amount) => {
    return await calculateRateFromPaths(paths, amount);
};

export async function getRate(sourceToken: Token, targetToken: Token, amount: string) {
    const paths = await generatePath(sourceToken, targetToken);
    return await getRateByPath(paths, amount);
}

export async function getAllPaths(sourceToken: Token, targetToken: Token) {
    if (sourceToken.blockchainType == 'ethereum' && targetToken.blockchainType == 'ethereum')
        return await ethereumGetAllPaths(sourceToken.blockchainId, targetToken.blockchainId);
    throw new Error(sourceToken.blockchainType + ' blockchain to ' + targetToken.blockchainType + ' blockchain not supported');
}

export default {
    init,
    getRate,
    generatePath,
    getRateByPath,
    getAllPaths
};
