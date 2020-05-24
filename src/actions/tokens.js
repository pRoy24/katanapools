import axios from 'axios';

import {getRequest} from './common';

const API_SERVER = process.env.REACT_APP_API_SERVER;

export const SET_CONVERTIBLE_TOKEN_PATHS = 'SET_CONVERTIBLE_TOKEN_PATHS';

export const SET_CONVERTIBLE_TOKENS = 'SET_CONVERTIBLE_TOKENS';

export const SET_SMART_TOKENS = 'SET_SMART_TOKENS';

export const SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP = 'SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP';

export const SET_PATH_LIST_WITH_RATE = 'SET_PATH_LIST_WITH_RATE';

export const SET_FROM_PATH_LIST_WITH_RATE = 'SET_FROM_PATH_LIST_WITH_RATE';

export const SET_TO_PATH_LIST_WITH_RATE = 'SET_TO_PATH_LIST_WITH_RATE';

export const SET_SMART_TOKENS_WITH_RESERVES = 'SET_SMART_TOKENS_WITH_RESERVES';

export const RESET_FROM_PATH_LIST ='RESET_FROM_PATH_LIST';

export const RESET_TO_PATH_LIST = 'RESET_TO_PATH_LIST';


export const RESET_TOKEN_PATHS = 'RESET_TOKEN_PATHS';

export const GET_TOKEN_PATHS_WITH_RATE = 'GET_TOKEN_PATHS_WITH_RATE';

export const GET_TOKEN_PATHS_WITH_RATE_SUCCESS = 'GET_TOKEN_PATHS_WITH_RATE_SUCCESS';

export const GET_TOKEN_PATHS_WITH_RATE_FAILURE = 'GET_TOKEN_PATHS_WITH_RATE_FAILURE';

export const SET_FROM_PATH_LIST_LOADING = 'SET_FROM_PATH_LIST_LOADING';

export const SET_TO_PATH_LIST_LOADING = 'SET_TO_PATH_LIST_LOADING';

export const REFETCH_SMART_AND_CONVERTIBLE_TOKENS = 'REFETCH_SMART_AND_CONVERTIBLE_TOKENS';
export const REFETCH_SMART_AND_CONVERTIBLE_TOKENS_SUCCESS = 'REFETCH_SMART_AND_CONVERTIBLE_TOKENS_SUCCESS';
export const REFETCH_SMART_AND_CONVERTIBLE_TOKENS_FAILURE = 'REFETCH_SMART_AND_CONVERTIBLE_TOKENS_FAILURE';

export function refetchSmartAndConvertibleTokens() {
    const request = getRequest(`/refetch_all_tokens`, 'GET');
    return {
      type: REFETCH_SMART_AND_CONVERTIBLE_TOKENS,
      payload: request
    }
}

export function refetchSmartAndConvertibleTokensSuccess(response) {
    return {
        type: REFETCH_SMART_AND_CONVERTIBLE_TOKENS_SUCCESS,
        payload: response
    }
}

export function refetchSmartAndConvertibleTokensFailure(err) {
    return {
        type: REFETCH_SMART_AND_CONVERTIBLE_TOKENS_FAILURE,
        payload: err
    }
}

export function setFromPathListLoading() {
    return {
        type: SET_FROM_PATH_LIST_LOADING
    }
}

export function setToPathListLoading() {
    return {
        type: SET_TO_PATH_LIST_LOADING
    }
}

export function getTokenPathsWithRate(fromToken, toToken, type, amount) {
    const request =  getRequest(`/token_paths_with_rates?fromToken=${fromToken}&toToken=${toToken}&type=${type}&amount=${amount}`, 'GET');
    return {
        type: GET_TOKEN_PATHS_WITH_RATE,
        payload: request
    }
}

export function getTokenPathsWithRateSuccess(response) {
    return {
        type: GET_TOKEN_PATHS_WITH_RATE_SUCCESS,
        payload: response
    }
}

export function getTokenPathsWithRateFailure(err) {
    return {
        type: GET_TOKEN_PATHS_WITH_RATE_FAILURE,
        payload: err
    }
}

export function resetTokenPaths() {
    return {
        type: RESET_TOKEN_PATHS
    }
}

export function resetFromPathList() {
    return {
        type: RESET_FROM_PATH_LIST,
    }
}

export function resetToPathList() {
    return {
        type: RESET_TO_PATH_LIST
    }
}

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

export function setSmartTokens(payload) {
    return {
        type: SET_SMART_TOKENS,
        payload: payload
    }
}

export function setSmartTokensWithReserves(payload) {
    return {
        type: SET_SMART_TOKENS_WITH_RESERVES,
        payload: payload
    }
}
export function setConvertibleTokensBySmartTokensMap(dataList) {
    return {
        type: SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP,
        payload: dataList
    }
}


