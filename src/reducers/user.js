import { SET_USER_ENVIRONMENT, SET_PROVIDER_CONNECTED } from '../actions/user';
const REACT_APP_MULTICALL_ADDRESS_ROPSTEN = process.env.REACT_APP_MULTICALL_ADDRESS_ROPSTEN;
const REACT_APP_BNT_ID_ROPSTEN = process.env.REACT_APP_BNT_ID_ROPSTEN;
const REACT_APP_ETHER_ID_ROPSTEN = process.env.REACT_APP_ETHER_ID_ROPSTEN;
const REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;

const REACT_APP_MULTICALL_ADDRESS_MAINNET = process.env.REACT_APP_MULTICALL_ADDRESS_MAINNET;
const REACT_APP_BNT_ID_MAINNET = process.env.REACT_APP_BNT_ID_MAINNET;
const REACT_APP_ETHER_ID_MAINNET = process.env.REACT_APP_ETHER_ID_MAINNET;
const REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET = process.env.REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;



const initialState = {
  SelectedAddress: '',
  SelectedNetwork: '',
  MulticallAddress: '',
  BNT_ID: '',
  CONTRACT_REGISTRY: '',
  ETHER_ID: '',
  providerConnected: false,
  providerType: '',
}

export default function userReducer (state = initialState, action) {
  switch (action.type) {
    case SET_USER_ENVIRONMENT:
      const {selectedAddress, selectedNetwork}  = action.payload;
      let multicallAddress = REACT_APP_MULTICALL_ADDRESS_MAINNET;
      let bntID = REACT_APP_BNT_ID_MAINNET;
      let etherID = REACT_APP_ETHER_ID_MAINNET;
      let contractRegistry = REACT_APP_BANCOR_CONTRACT_REGISTRY_MAINNET;
      

      if (selectedNetwork === 3) {
        multicallAddress = REACT_APP_MULTICALL_ADDRESS_ROPSTEN;
        bntID = REACT_APP_BNT_ID_ROPSTEN;
        etherID = REACT_APP_ETHER_ID_ROPSTEN;
        contractRegistry = REACT_APP_BANCOR_CONTRACT_REGISTRY_ROPSTEN;
      }
      
      return {
        ...state, 
        SelectedAddress: selectedAddress,
        SelectedNetwork: selectedNetwork, 
        MulticallAddress: multicallAddress,
        BNT_ID: bntID,
        CONTRACT_REGISTRY: contractRegistry,
        ETHER_ID: etherID
      }
    case SET_PROVIDER_CONNECTED:
      return {...state, providerConnected: true, providerType: action.payload.type}

    default:
      return state
  }
}

