import { createActions, handleActions } from 'redux-actions';
import Web3 from 'web3';

import { getMainContract } from 'go-post-api';

const defaultState = {
  isConnected: false,
  error: null,
  web3: null,
  networkId: null,
  account: null,
  contracts: {
    main: null,
  },
};

const { connected, fail, setMainContract } = createActions({
  CONNECTED: (web3, networkId, account) => ({ web3, networkId, account }),
  FAIL: (error) => ({ error }),
  SET_MAIN_CONTRACT: (contract) => ({ contract }),
}, { prefix: 'app/contracts' });

const web3 = new Web3();

export const init = () => async dispatch => {
  try {
    let networkId = null;

    if (typeof window.web3 !== 'undefined') { // MetaMask
      web3.setProvider(window.web3.currentProvider);
      networkId = await web3.eth.net.getId();
    }

    if (networkId === null) {
      web3.setProvider('ws://localhost:8545');
      networkId = await web3.eth.net.getId();
    }

    const [account] = await web3.eth.getAccounts();
    if (!account) {
      throw new Error('MetaMask locked');
    }

    dispatch(setMainContract(await getMainContract(web3, networkId)));

    dispatch(connected(web3, networkId, account));
  } catch (e) {
    dispatch(fail(e));
  }
}

const reducer = handleActions(
  {
    [connected]: (state, { payload: { web3, networkId, account } }) => ({
      ...state,
      isConnected: true,
      web3,
      networkId,
      account
    }),
    [fail]: (state, { payload: { error } }) => ({
      ...defaultState,
      error
    }),
    [setMainContract]: (state, { payload: { contract } }) => ({
      ...state,
      contracts: {
        ...state.contracts,
        main: contract
      }
    }),
  },
  defaultState
);

export default reducer;
