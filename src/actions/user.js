export const SET_USER_ENVIRONMENT = 'SET_USER_ENVIRONMENT';

export function setUserEnvironment(payload) {
  return {
    type: SET_USER_ENVIRONMENT,
    payload: payload
  }
}