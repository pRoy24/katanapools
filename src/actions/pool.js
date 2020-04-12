export const DEPLOY_SMART_TOKEN_INIT = 'DEPLOY_SMART_TOKEN_INIT';

export const DEPLOY_SMART_TOKEN_PENDING = 'DEPLOY_SMART_TOKEN_PENDING';

export const DEPLOY_SMART_TOKEN_RECEIPT = 'DEPLOY_SMART_TOKEN_RECEIPT';

export const DEPLOY_SMART_TOKEN_CONFIRMATION = 'DEPLOY_SMART_TOKEN_CONFIRMATION';

export const DEPLOY_SMART_TOKEN_ERROR = 'DEPLOY_SMART_TOKEN_ERROR';

export const DEPLOY_SMART_TOKEN_SUCCESS = 'DEPLOY_SMART_TOKEN_SUCCESS';

export const DEPLOY_RELAY_CONVERTER_STATUS = 'DEPLOY_RELAY_CONVERTER_STATUS';

export const SET_CONVERTER_CONTRACT_RECEIPT = 'SET_CONVERTER_CONTRACT_RECEIPT';

export const SET_POOL_FUNDED_STATUS = 'SET_POOL_FUNDED_STATUS';

export const SET_ACTIVATION_STATUS = 'SET_ACTIVATION_STATUS';

export const SET_POOL_CREATION_RECEIPT = 'SET_POOL_CREATION_RECEIPT';

export const SET_CURRENT_SELECTED_POOL = 'SET_CURRENT_SELECTED_POOL';

export const SET_CURRENT_SELECTED_POOL_ERROR = 'SET_CURRENT_SELECTED_POOL_ERROR';

export const SET_TOKEN_LIST_DETAILS = 'SET_TOKEN_LIST_DETAILS';

export const SET_TOKEN_LIST_ROW = 'SET_TOKEN_LIST_ROW';

export const SET_POOL_HISTORY = 'SET_POOL_HISTORY';

export const SET_POOL_TRANSACTION_STATUS = 'SET_POOL_TRANSACTION_STATUS';

export const RESET_POOL_STATUS = 'RESET_POOL_STATUS';

export const DEPLOY_RELAY_CONVERTER_SUCCESS = 'DEPLOY_RELAY_CONVERTER_SUCCESS';

export const SET_POOL_FUNDED_SUCCESS = 'SET_POOL_FUNDED_SUCCESS';

export const SET_ACTIVATION_SUCCESS = 'SET_ACTIVATION_SUCCESS';

export const RESET_POOL_HISTORY = 'RESET_POOL_HISTORY';

export const SET_CURRENT_POOL_STATUS = 'SET_CURRENT_POOL_STATUS';

export const SET_CONVERTER_CONTRACT = 'SET_CONVERTER_CONTRACT';

export const SET_POOL_CREATION_HEADER = 'SET_POOL_CREATION_HEADER';

export function setPoolCreationHeader(payload) {
  return {
    type: SET_POOL_CREATION_HEADER,
    payload: payload
  }  
}

export function setConverterContract(payload) {
  return {
    type: SET_CONVERTER_CONTRACT,
    payload: payload
  }
}

export function resetPoolHistory() {
  return {
    type: RESET_POOL_HISTORY
  }
}

export function setCurrentPoolStatus(payload) {
  return {
    type: SET_CURRENT_POOL_STATUS,
    payload: payload
  }
}

export function setActivationSuccess() {
  return {
    type: SET_ACTIVATION_SUCCESS,
    payload: {}
  }
}

export function setPoolFundedSuccess() {
  return {
    type: SET_POOL_FUNDED_SUCCESS,
    payload: {}
  }
}

export function deployRelayConverterSuccess() {
  return {
    type: DEPLOY_RELAY_CONVERTER_SUCCESS,
    payload: {}
  }
}

export function resetPoolStatus() {
  return {
    type: RESET_POOL_STATUS,
    payload: {}
  }
}
export function setPoolTransactionStatus(payload) {
  return {
    type: SET_POOL_TRANSACTION_STATUS,
    payload: payload
  }
}
export function setPoolHistory(payload) {
  return {
    payload: payload,
    type: SET_POOL_HISTORY
  }
}

export function setTokenListRow() {
  return {
    type: SET_TOKEN_LIST_ROW,
    payload: [],
  }
}

export function setTokenListDetails(payload) {
  return {
    type: SET_TOKEN_LIST_DETAILS,
    payload: payload
  }
}



export function setCurrentSelectedPoolError(payload) {
  return {
    type: SET_CURRENT_SELECTED_POOL_ERROR,
    payload: payload
  }
}

export function setCurrentSelectedPool(payload) {
  return {
    type: SET_CURRENT_SELECTED_POOL,
    payload: payload
  }
}

export function setPoolCreationReceipt(receipt) {
  return {
    type: SET_POOL_CREATION_RECEIPT,
    payload: receipt
  }
}

export function setPoolFundedStatus(payload) {
  return {
    type: SET_POOL_FUNDED_STATUS,
    payload: payload
  }
}

export function setRelayTokenContractReceipt(payload) {
  return {
    type: SET_CONVERTER_CONTRACT_RECEIPT,
    payload: payload
  }
}


export function deploySmartTokenInit(payload) {
  return {
    type: DEPLOY_SMART_TOKEN_INIT,
    payload: payload
  }
}

export function deploySmartTokenPending(payload) {
  return {
    type: DEPLOY_SMART_TOKEN_PENDING,
    payload: payload
  }
}

export function deploySmartTokenReceipt(payload) {

  return {
    type: DEPLOY_SMART_TOKEN_RECEIPT,
    payload: payload
  }
}

export function deploySmartTokenConfirmation(payload) {

  return {
    type: DEPLOY_SMART_TOKEN_CONFIRMATION,
    payload: payload
  }
}

export function deploySmartTokenError(payload) {
  return {
    type: DEPLOY_SMART_TOKEN_ERROR,
    payload: payload
  }
}

export function deploySmartTokenSuccess(payload) {
  return {
    type: DEPLOY_SMART_TOKEN_SUCCESS,
    payload: payload
  }
}

export function deployRelayConverterStatus(payload) {
  return {
    type: DEPLOY_RELAY_CONVERTER_STATUS,
    payload: payload
  }
}

export function setActivationStatus(payload) {
  return {
    type: SET_ACTIVATION_STATUS,
    payload: payload
  }
}