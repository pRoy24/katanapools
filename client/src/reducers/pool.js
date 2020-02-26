import { DEPLOY_SMART_TOKEN_INIT, DEPLOY_SMART_TOKEN_PENDING, DEPLOY_SMART_TOKEN_RECEIPT, DEPLOY_SMART_TOKEN_CONFIRMATION
,DEPLOY_SMART_TOKEN_ERROR, DEPLOY_SMART_TOKEN_SUCCESS, DEPLOY_RELAY_TOKEN_STATUS, SET_CONVERTER_CONTRACT_RECEIPT, SET_POOL_FUNDED_STATUS} from '../actions/pool';

const initialState = {
  smartTokenStatus: {},
  smartTokenContract: {},
  isError: false,
  isFetching: false,
  tokenSymbol: '',
  relayTokenStatus: {},
  converterContractReceipt: {},
  poolFundedStatus: {}
}

export default function poolReducer (state = initialState, action) {
  switch (action.type) {
    case DEPLOY_SMART_TOKEN_INIT:
      return {
        ...state,
        smartTokenStatus: {'message': action.payload.message, tokenSymbol: action.payload.symbol},
        isError: false,
        isFetching: true
      }
    case DEPLOY_SMART_TOKEN_PENDING:

      return {
        ...state,
        smartTokenStatus: {'transactionHash': action.payload},
        smartTokenContract: {},
        isError: false,
        isFetching: true

      }
    case DEPLOY_SMART_TOKEN_RECEIPT:

      return {
        ...state,
        smartTokenStatus:  action.payload,
        isError: false,
        isFetching: true
      }
    case DEPLOY_SMART_TOKEN_CONFIRMATION:
      return {
        ...state,
        isError: false,
        isFetching: false,
        smartTokenStatus: action.payload
      }
    case DEPLOY_SMART_TOKEN_ERROR:
      return {
        ...state,
        smartTokenStatus: action.payload,
        isError: true,
        isFetching: false,
      }
    case DEPLOY_SMART_TOKEN_SUCCESS:
      return {
        ...state,
        smartTokenContract: action.payload,
        isError: false,
        isFetching: false,
      }
    case DEPLOY_RELAY_TOKEN_STATUS:
      return {
        ...state,
        relayTokenStatus: action.payload
      }
    case SET_CONVERTER_CONTRACT_RECEIPT:
      return {...state, converterContractReceipt: action.payload}
      
    case SET_POOL_FUNDED_STATUS:
      return {...state, poolFundedStatus: action.payload}
      
    default:
      return state
  }
}