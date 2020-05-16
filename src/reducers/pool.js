import { DEPLOY_SMART_TOKEN_INIT, DEPLOY_SMART_TOKEN_PENDING, DEPLOY_SMART_TOKEN_RECEIPT, DEPLOY_SMART_TOKEN_CONFIRMATION
,DEPLOY_SMART_TOKEN_ERROR, DEPLOY_SMART_TOKEN_SUCCESS, DEPLOY_RELAY_CONVERTER_STATUS, SET_CONVERTER_CONTRACT_RECEIPT,
SET_POOL_FUNDED_STATUS, SET_ACTIVATION_STATUS, SET_POOL_CREATION_RECEIPT, SET_CURRENT_SELECTED_POOL, SET_CURRENT_SELECTED_POOL_ERROR,
  SET_TOKEN_LIST_DETAILS, SET_TOKEN_LIST_ROW, SET_POOL_HISTORY, SET_POOL_TRANSACTION_STATUS, RESET_POOL_STATUS,
  DEPLOY_RELAY_CONVERTER_SUCCESS, SET_POOL_FUNDED_SUCCESS, SET_ACTIVATION_SUCCESS, SET_CURRENT_POOL_STATUS, RESET_POOL_HISTORY,
  SET_CONVERTER_CONTRACT, SET_POOL_CREATION_HEADER, GET_POOL_DETAILS, GET_POOL_DETAILS_SUCCESS, GET_POOL_DETAILS_FAILURE,
  GET_POOL_APPROVAL, GET_POOL_APPROVAL_SUCCESS, GET_POOL_REVOCATION, GET_POOL_REVOCATION_SUCCESS
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
  poolTransactionStatus: {},
  poolStatus: {},
  converterContract: {},
  poolCreationHeader: 'Create new liquidity pool',
  poolApproval: '',
  poolRevocation: '',
}

const deploy_steps = [
  {'type': 'create-pool', idx: 0},
  {'type': 'deploy-converter', idx: 0},
  {'type': 'add-reserves', idx: 0},
  {'type': 'set-conversion-fee', idx: 0},
  {'type': 'fund-relay', idx: 0},
  ]


export default function poolReducer (state = initialState, action) {
  let currentTokenList;
  switch (action.type) {
    case GET_POOL_APPROVAL:
      return {...state, poolApproval: 'init'};
    case GET_POOL_APPROVAL_SUCCESS:
      return {...state, poolApproval: 'success'};
    case GET_POOL_REVOCATION:
      return {...state, poolRevocation: 'init'};
    case GET_POOL_REVOCATION_SUCCESS:
      return {...state, poolRevocation: 'success'};
    case SET_POOL_CREATION_HEADER:
      return {...state, poolCreationHeader: action.payload}
    case SET_CONVERTER_CONTRACT:
      return {...state, converterContract: action.payload}
    case RESET_POOL_HISTORY:
      return {...state, poolHistory: []}
    case SET_CURRENT_POOL_STATUS:
      return {...state, poolStatus: action.payload}
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
        smartTokenStatus: {'type': 'pending', 'message': action.payload.message},
         tokenSymbol: action.payload.symbol,
        smartTokenContract: {},
        isError: false,
        isFetching: true,
        isCreationStepPending: true,
      }
    case DEPLOY_SMART_TOKEN_PENDING:
      let messageStatus = {'type': 'pending'};
      if (action.payload.transactionHash) {
        messageStatus.message = '';
        messageStatus.transactionHash = action.payload.transactionHash;
      } else {
        messageStatus.message = action.payload;
        messageStatus.transactionHash = null;
      }
      return {
        ...state,
        smartTokenStatus: messageStatus,
        isError: false,
        isFetching: true,
        isCreationStepPending: true,
      }
    case DEPLOY_SMART_TOKEN_RECEIPT:

      return {
        ...state,
        smartTokenStatus:  {'type': 'pending', 'message': action.payload},
        isError: false,
      }
    case DEPLOY_SMART_TOKEN_CONFIRMATION:
      return {
        ...state,
        isError: false,
      }
    case DEPLOY_SMART_TOKEN_ERROR:
      return {
        ...state,
        smartTokenStatus: {'type': 'error', 'message': action.payload},
        isError: true,
      }
    case DEPLOY_SMART_TOKEN_SUCCESS:
      return {
        ...state,
        smartTokenContract: action.payload,
        smartTokenStatus: {'type': 'success', 'message': 'successfully deployed smart token'},
        isError: false,
        isFetching: false,
      }
    case DEPLOY_RELAY_CONVERTER_SUCCESS:
      return {...state, isCreationStepPending: false}

    case DEPLOY_RELAY_CONVERTER_STATUS:
      let isFetchingStatus = false;
      if (action.payload.type === 'pending') {
        isFetchingStatus = true;
      }
      let isErrorState = false;
      if (action.payload.type === 'error') {
        isErrorState = true;
      }
      return {
        ...state,
        isFetching: isFetchingStatus,
        relayConverterStatus: action.payload,
        isCreationStepPending: true,
        isError: isErrorState
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
    case GET_POOL_DETAILS:
      return {...state, currentSelectedPool: {}};
    case GET_POOL_DETAILS_SUCCESS:
      return {...state, currentSelectedPool: action.payload.data};
    case GET_POOL_DETAILS_FAILURE:
      return {...state, currentSelectedPool: {}};
    default:
      return state
  }
}