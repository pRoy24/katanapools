import { DEPLOY_SMART_TOKEN_INIT, DEPLOY_SMART_TOKEN_PENDING, DEPLOY_SMART_TOKEN_RECEIPT, DEPLOY_SMART_TOKEN_CONFIRMATION
,DEPLOY_SMART_TOKEN_ERROR, DEPLOY_SMART_TOKEN_SUCCESS, DEPLOY_RELAY_CONVERTER_STATUS, SET_CONVERTER_CONTRACT_RECEIPT,
SET_POOL_FUNDED_STATUS, SET_ACTIVATION_STATUS, SET_POOL_CREATION_RECEIPT, SET_CURRENT_SELECTED_POOL} from '../actions/pool';

const initialState = {
  smartTokenStatus: {},
  smartTokenContract: {},
  isError: false,
  isFetching: false,
  tokenSymbol: '',
  relayConverterStatus: {},
  converterContractReceipt: {},
  poolFundedStatus: {},
  activationStatus: {},
  poolCreationReceipt: {},
  currentSelectedPool: {}
}

export default function poolReducer (state = initialState, action) {
  switch (action.type) {
    case DEPLOY_SMART_TOKEN_INIT:
      return {
        ...state,
        smartTokenStatus: {'message': action.payload.message},
         tokenSymbol: action.payload.symbol,
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
    case DEPLOY_RELAY_CONVERTER_STATUS:
      return {
        ...state,
        relayConverterStatus: action.payload
      }
    case SET_CONVERTER_CONTRACT_RECEIPT:
      return {...state, converterContractReceipt: action.payload}
      
    case SET_POOL_FUNDED_STATUS:
      return {...state, poolFundedStatus: action.payload}
    case SET_ACTIVATION_STATUS:
      return {...state, activationStatus: action.payload}
    case SET_POOL_CREATION_RECEIPT:
      return {...state, poolCreationReceipt: action.payload}
    case SET_CURRENT_SELECTED_POOL:
      return {...state, currentSelectedPool: action.payload}
    default:
      return state
  }
}