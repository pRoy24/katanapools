import { combineReducers } from 'redux';
import poolReducer from './pool';
import swapReducer from './swap';
import userReducer from './user';
import tokensReducer from './tokens';

const rootReducer = combineReducers({
  swap: swapReducer,
  pool: poolReducer,
  user: userReducer,
  tokens: tokensReducer
})

export default rootReducer