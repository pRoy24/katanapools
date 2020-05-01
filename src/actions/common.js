export function getRequest(path, requestType, payload = null) {
  const axios = require('axios');
  let networkVersion = '1';
  if (window.web3 && window.web3.currentNetowrk) {
    networkVersion = window.web3.currentNetowrk.networkVersion;
  }
  const API_SERVER = process.env.REACT_APP_API_SERVER;
  let request = null;
  if (requestType === 'POST' || requestType === 'PUT') {
    request = axios({
      method: requestType,
      headers: {
        'networkType': networkVersion
      },
      url: `${API_SERVER}${path}`,
      data: payload
    });
  } else {
    request = axios({
      method: requestType,
      headers: {
        'networkType': networkVersion
      },
      url: `${API_SERVER}${path}`,
    });
  }
  return request;
}