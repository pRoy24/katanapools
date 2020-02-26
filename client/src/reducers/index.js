import { combineReducers } from 'redux';
import poolReducer from './pool';
import swapReducer from './swap';

const rootReducer = combineReducers({
  swap: swapReducer,
  pool: poolReducer
})

export default rootReducer