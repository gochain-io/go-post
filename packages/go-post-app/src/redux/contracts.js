// @flow

import { createActions, handleActions } from 'redux-actions';
import Web3 from 'web3';

import { getMainContract } from 'go-post-api';

import { initMiniwallet } from './miniwallet';

const errorType = {
  NETWORK: 'network',
  NO_METAMASK: 'no_metamask',
  METAMASK_LOCKED: 'metamask_locked',
  DISCONNECTED: 'disconnected'
};

const defaultState = {
  isConnected: false,
  errorType: null,
  error: null,
  web3: null,
  networkId: null,
  account: null,
  contracts: {
    main: null,
  },
  lastBlockTime: new Date(),
};

const { connected, web3Error, setMainContract, setLastBlockTime } = createActions({
  CONNECTED: (web3, networkId, account) => ({ web3, networkId, account }),
  WEB3_ERROR: (errorType, error) => ({ errorType, error }),
  SET_MAIN_CONTRACT: (contract) => ({ contract }),
  SET_LAST_BLOCK_TIME: (lastBlockTime) => ({ lastBlockTime }),
}, { prefix: 'app/contracts' });

const web3 = new Web3();

export const init = () => async dispatch => {
  try {
    let networkId = null;

    if (typeof window.web3 !== 'undefined') { // MetaMask
      web3.setProvider(window.web3.currentProvider);
      networkId = await web3.eth.net.getId();
    }

    if (!networkId) {
      web3.setProvider('ws://localhost:8545');
      networkId = await web3.eth.net.getId();
    }

    if (!networkId) {
      dispatch(web3Error(new Error('Could not connect to web3 provider.'), errorType.NETWORK));
      return;
    }

    const [account] = await web3.eth.getAccounts();

    setInterval(async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts[0] !== account) {
        window.location.reload();
        return;
      }

      const id = await web3.eth.net.getId();
      if (id !== networkId) {
        window.location.reload();
      }
    }, 1000);

    if (!account) {
      dispatch(web3Error(new Error('MetaMask locked'), errorType.METAMASK_LOCKED));
      return;
    }

    web3.eth.subscribe('newBlockHeaders', (e) => {
      if (e) {
        console.error('newBlockHeaders error', e);
        dispatch(web3Error(e, errorType.DISCONNECTED));
      } else {
        dispatch(setLastBlockTime(new Date()));
      }
    });

    dispatch(setMainContract(await getMainContract(web3, networkId)));

    dispatch(connected(web3, networkId, account));
    await dispatch(initMiniwallet());
  } catch (e) {
    dispatch(web3Error(e, errorType.NETWORK));
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
    [web3Error]: (state, { payload: { errorType, error } }) => ({
      ...defaultState,
      errorType,
      error
    }),
    [setMainContract]: (state, { payload: { contract } }) => ({
      ...state,
      contracts: {
        ...state.contracts,
        main: contract
      }
    }),
    [setLastBlockTime]: (state, { payload: { lastBlockTime } }) => ({
      ...state,
      lastBlockTime
    }),
  },
  defaultState
);

export default reducer;
