export const SET_CONVERTIBLE_TOKEN_PATHS = 'SET_CONVERTIBLE_TOKEN_PATHS';

export const SET_CONVERTIBLE_TOKENS = 'SET_CONVERTIBLE_TOKENS';

export const SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP = 'SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP';

export const SET_PATH_LIST_WITH_RATE = 'SET_PATH_LIST_WITH_RATE';

export const SET_FROM_PATH_LIST_WITH_RATE = 'SET_FROM_PATH_LIST_WITH_RATE';

export const SET_TO_PATH_LIST_WITH_RATE = 'SET_TO_PATH_LIST_WITH_RATE';

export function setFromPathListWithRates(payload) {
    return {
        type: SET_FROM_PATH_LIST_WITH_RATE,
        payload: payload
    }    
}

export function setToPathListWithRates(payload) {
    return {
        type: SET_TO_PATH_LIST_WITH_RATE,
        payload: payload
    }
}

export function setPathListWithRates(payload) {
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