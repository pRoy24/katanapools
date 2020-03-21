export const SET_USER_ENVIRONMENT = 'SET_USER_ENVIRONMENT';

export const SET_PROVIDER_CONNECTED = 'SET_PROVIDER_CONNECTED';

export function setUserEnvironment(payload) {
  return {
    type: SET_USER_ENVIRONMENT,
    payload: payload
  }
}

export function setProviderConnected(payload) {
  return {
    type: SET_PROVIDER_CONNECTED,
    payload: payload
  }
}