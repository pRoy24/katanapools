import { SET_CONVERTIBLE_TOKENS, SET_SMART_TOKENS, SET_CONVERTIBLE_TOKEN_PATHS, SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP,
SET_PATH_LIST_WITH_RATE, SET_FROM_PATH_LIST_WITH_RATE, SET_TO_PATH_LIST_WITH_RATE, SET_SMART_TOKENS_WITH_RESERVES,
RESET_FROM_PATH_LIST, RESET_TO_PATH_LIST, RESET_TOKEN_PATHS, GET_TOKEN_PATHS_WITH_RATE, GET_TOKEN_PATHS_WITH_RATE_SUCCESS,
  GET_TOKEN_PATHS_WITH_RATE_FAILURE, SET_FROM_PATH_LIST_LOADING, SET_TO_PATH_LIST_LOADING
} from '../actions/tokens';

import {GET_CONVERTIBLE_TOKENS, GET_CONVERTIBLE_TOKENS_SUCCESS, GET_CONVERTIBLE_TOKENS_FAILURE, GET_SMART_TOKENS,
  GET_SMART_TOKENS_SUCCESS, GET_SMART_TOKENS_FAILURE
} from '../actions/app';


const initialState = {
  convertibleTokens: [],
  smartTokens: [],
  convertibleTokensBySmartTokens: [],
  pathListWithRate: [],
  fromPathListWithRate: [],
  toPathListWithRate: [],
  smartTokensWithReserves: [],
  fromPathLoading: false,
  toPathLoading: false,

}

export default function tokensReducer (state = initialState, action) {
  switch (action.type) {
    case SET_FROM_PATH_LIST_LOADING:
      return {...state, fromPathLoading: true}
    case SET_TO_PATH_LIST_LOADING:
      return {...state, toPathLoading: true}
    case SET_CONVERTIBLE_TOKENS:
      return {...state, convertibleTokens: action.payload};
    case SET_SMART_TOKENS:
      return {...state, smartTokens: action.payload};

    case SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP:
      return {...state, convertibleTokensBySmartTokens: action.payload};
    case SET_PATH_LIST_WITH_RATE:
      return {...state, pathListWithRate: action.payload}
    case SET_CONVERTIBLE_TOKEN_PATHS:
        return {...state}
    case SET_FROM_PATH_LIST_WITH_RATE:
      return {...state, fromPathListWithRate: action.payload.data, fromPathLoading: false}
    case SET_TO_PATH_LIST_WITH_RATE:
      return {...state, toPathListWithRate: action.payload.data,  toPathLoading: false}
    case SET_SMART_TOKENS_WITH_RESERVES:
      return {...state, smartTokensWithReserves: action.payload}
    case RESET_FROM_PATH_LIST:
      return {...state, fromPathLoading: true};
    case RESET_TO_PATH_LIST:
      return {...state, toPathLoading: true};
    case RESET_TOKEN_PATHS:
      return {...state, fromPathListWithRate: [], toPathListWithRate: []};
    case GET_CONVERTIBLE_TOKENS:
      return {...state, convertibleTokens: []};
    case GET_CONVERTIBLE_TOKENS_SUCCESS:
      console.log()
      return {...state, convertibleTokens: action.payload.data};
    case GET_SMART_TOKENS:
      return {...state, smartTokens: []};
    case GET_SMART_TOKENS_SUCCESS:
      return {...state, smartTokens: action.payload.data};
    case GET_TOKEN_PATHS_WITH_RATE:
      return {...state}
    case GET_TOKEN_PATHS_WITH_RATE_SUCCESS:
      return {...state}
    case GET_TOKEN_PATHS_WITH_RATE_FAILURE:
      return {...state}
    default:
      return state
  }
}

