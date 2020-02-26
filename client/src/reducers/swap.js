import { APPROVE_STEP_PENDING, APPROVE_STEP_SUCCESS, APPROVE_STEP_FAILURE, } from '../actions/swap';

const initialState = {
  approve: {},
  isError: false,
  isFetching: false,
}

export default function swapReducer (state = initialState, action) {
  switch (action.type) {
    case APPROVE_STEP_PENDING:
      return {
        ...state,
        approve: action.payload,
        isError: false,
        isFetching: true
      }
    case APPROVE_STEP_SUCCESS:
      return {
        ...state,
        approve: action.payload,
        isError: false,
        isFetching: false

      }
    case APPROVE_STEP_FAILURE:
      return {
        ...state,
        approve: action.payload,
        isError: true,
        isFetching: false
      }
    default:
      return state
  }
}