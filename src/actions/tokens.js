export const SET_CONVERTIBLE_TOKEN_PATHS = 'SET_CONVERTIBLE_TOKEN_PATHS';

export const SET_CONVERTIBLE_TOKENS = 'SET_CONVERTIBLE_TOKENS';

export const SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP = 'SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP';

export const SET_PATH_LIST_WITH_RATE = 'SET_PATH_LIST_WITH_RATE';

export function setPathListWithRates(payload) {
    console.log(payload);
    return {
        type: SET_PATH_LIST_WITH_RATE,
        payload: payload
    }    
}

export function setConvertibleTokens(dataList) {
    return {
        type: SET_CONVERTIBLE_TOKENS,
        payload: dataList
    }
}

export function setConvertibleTokensBySmartTokensMap(dataList) {
    return {
        type: SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP,
        payload: dataList
    }
}