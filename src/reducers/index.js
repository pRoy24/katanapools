import { combineReducers } from 'redux';
import poolReducer from './pool';
import swapReducer from './swap';
import userReducer from './user';

const rootReducer = combineReducers({
  swap: swapReducer,
  pool: poolReducer,
  user: userReducer
})

export default rootReducer