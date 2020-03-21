import { DEPLOY_SMART_TOKEN_INIT, DEPLOY_SMART_TOKEN_PENDING, DEPLOY_SMART_TOKEN_RECEIPT, DEPLOY_SMART_TOKEN_CONFIRMATION
,DEPLOY_SMART_TOKEN_ERROR, DEPLOY_SMART_TOKEN_SUCCESS, DEPLOY_RELAY_CONVERTER_STATUS, SET_CONVERTER_CONTRACT_RECEIPT,
SET_POOL_FUNDED_STATUS, SET_ACTIVATION_STATUS, SET_POOL_CREATION_RECEIPT, SET_CURRENT_SELECTED_POOL, SET_CURRENT_SELECTED_POOL_ERROR,
  SET_TOKEN_LIST_DETAILS, SET_TOKEN_LIST_ROW, SET_POOL_HISTORY, SET_POOL_TRANSACTION_STATUS, RESET_POOL_STATUS,
  DEPLOY_RELAY_CONVERTER_SUCCESS, SET_POOL_FUNDED_SUCCESS, SET_ACTIVATION_SUCCESS
} from '../actions/pool';

const initialState = {
  smartTokenStatus: {},
  smartTokenContract: {},
  isError: false,
  isFetching: false,
  isCreationStepPending: false,
  tokenSymbol: '',
  relayConverterStatus: {},
  converterContractReceipt: {},
  poolFundedStatus: {},
  activationStatus: {},
  poolCreationReceipt: {},
  currentSelectedPool: {},
  currentSelectedPoolError: false,
  tokenList: [],
  poolHistory: [],
  poolTransactionStatus: {}
}

export default function poolReducer (state = initialState, action) {
  let currentTokenList;
  switch (action.type) {
    case RESET_POOL_STATUS:
      return {...state, smartTokenStatus: {}, smartTokenContract: {}, relayConverterStatus: {}, converterContractReceipt: {},
        poolFundedStatus: {}, activationStatus: {}, poolCreationReceipt: {}, isCreationStepPending: false,
      }
    case SET_POOL_HISTORY:
      return {...state, poolHistory: action.payload}

    case SET_TOKEN_LIST_ROW:
      currentTokenList = state.tokenList;
      currentTokenList.push({});
      return {...state, tokenList: currentTokenList};
    case SET_TOKEN_LIST_DETAILS:
      return {...state, tokenList: action.payload};

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
        isFetching: true,
        isCreationStepPending: true,

      }


    case DEPLOY_SMART_TOKEN_RECEIPT:

      return {
        ...state,
        smartTokenStatus:  action.payload,
        isError: false,
      }
    case DEPLOY_SMART_TOKEN_CONFIRMATION:
      return {
        ...state,
        isError: false,
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
        isCreationStepPending: false,
      }
    case DEPLOY_RELAY_CONVERTER_SUCCESS:
      return {...state, isCreationStepPending: false}

    case DEPLOY_RELAY_CONVERTER_STATUS:
      let isFetchingStatus = false;
      if (action.payload.type === 'pending') {
        isFetchingStatus = true;
      }
      return {
        ...state,
        isFetching: isFetchingStatus,
        relayConverterStatus: action.payload,
        isCreationStepPending: true,
      }
    case SET_CONVERTER_CONTRACT_RECEIPT:
      return {...state, isFetching: false, converterContractReceipt: action.payload}

    case SET_POOL_FUNDED_STATUS:
      let isCreationStepPending = false;

      if (action.payload.type === 'pending') {
        isCreationStepPending = true;
      }
      return {...state, poolFundedStatus: action.payload, isFetching: isCreationStepPending, isCreationStepPending: isCreationStepPending}

    case SET_POOL_FUNDED_SUCCESS:
      return {...state, isCreationStepPending: false}

    case SET_ACTIVATION_STATUS:
      return {...state, activationStatus: action.payload, isCreationStepPending: true}
    case SET_ACTIVATION_SUCCESS:
      return {...state, isCreationStepPending: false}
    case SET_POOL_CREATION_RECEIPT:
      return {...state, poolCreationReceipt: action.payload}
    case SET_CURRENT_SELECTED_POOL:
      return {...state, currentSelectedPool: action.payload, currentSelectedPoolError: false}
    case SET_CURRENT_SELECTED_POOL_ERROR:
      return {...state, currentSelectedPool: {}, currentSelectedPoolError: true}
    case SET_POOL_TRANSACTION_STATUS:
      return {...state, poolTransactionStatus: action.payload}
    default:
      return state
  }
}