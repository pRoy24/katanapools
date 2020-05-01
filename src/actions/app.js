import axios from 'axios';
import {getRequest} from './common';
const API_SERVER = process.env.REACT_APP_API_SERVER;

export const GET_CONVERTIBLE_TOKENS = 'GET_CONVERTIBLE_TOKENS';
export const GET_CONVERTIBLE_TOKENS_SUCCESS = 'GET_CONVERTIBLE_TOKENS_SUCCESS';
export const GET_CONVERTIBLE_TOKENS_FAILURE = 'GET_CONVERTIBLE_TOKENS_FAILURE';

export function getConvertibleTokens() {
  const req = getRequest('/fetch_convertible_tokens', 'GET');
  return {
    type: GET_CONVERTIBLE_TOKENS,
    payload: req
  }
}

export function getConvertibleTokensSuccess(response) {
  console.log(response);
  return {
    type: GET_CONVERTIBLE_TOKENS_SUCCESS,
    payload: response
  }
}

export function getConvertibleTokensFailure(err) {
  return {
    type: GET_CONVERTIBLE_TOKENS_FAILURE,
    payload: err
  }
}

