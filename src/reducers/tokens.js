import { SET_CONVERTIBLE_TOKENS, SET_SMART_TOKENS, SET_CONVERTIBLE_TOKEN_PATHS, SET_CONVERTIBLE_TOKENS_BY_SMART_TOKENS_MAP,
SET_PATH_LIST_WITH_RATE, SET_FROM_PATH_LIST_WITH_RATE, SET_TO_PATH_LIST_WITH_RATE, SET_SMART_TOKENS_WITH_RESERVES } from '../actions/tokens';



const initialState = {
  convertibleTokens: [],
  smartTokens: [],
  convertibleTokensBySmartTokens: [],
  pathListWithRate: [],
  fromPathListWithRate: [],
  toPathListWithRate: [],
  smartTokensWithReserves: []
}

export default function tokensReducer (state = initialState, action) {
  switch (action.type) {
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
      return {...state, fromPathListWithRate: action.payload}
    case SET_TO_PATH_LIST_WITH_RATE:
      return {...state, toPathListWithRate: action.payload}
    case SET_SMART_TOKENS_WITH_RESERVES:
      return {...state, smartTokensWithReserves: action.payload}
    default:
      return state
  }
}

