export const FETCH_TOKENS = 'FETCH_TOKENS';

export const APPROVE_STEP_PENDING = 'APPROVE_STEP_PENDING';

export const APPROVE_STEP_SUCCESS = 'APPROVE_STEP_SUCCESS';

export const APPROVE_STEP_FAILURE = 'APPROVE_STEP_FAILURE';

export function fetchTokens(payload) {
  return {
    type: FETCH_TOKENS,
    payload: payload
  }
}

export function approvePending(payload) {
  return {
    type: APPROVE_STEP_PENDING,
    payload: payload
  }
}

export function approveSuccess(payload) {
  return {
    type: APPROVE_STEP_SUCCESS,
    payload: payload
  }
}

export function approveFailure(payload) {
  return {
    type: APPROVE_STEP_FAILURE,
    payload: payload
  }
}
