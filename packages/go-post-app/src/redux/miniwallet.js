import BN from 'bn.js';
import { createActions, handleActions } from 'redux-actions';

import { MiniwalletArtifact } from 'go-post-api';

const walletBalanceRecommended = new BN(10).pow(new BN(18));
const walletBalanceLow = new BN(10).pow(new BN(17));
const accountBalanceRecommended = new BN(10).pow(new BN(16));
const accountBalanceLow = new BN(10).pow(new BN(15));
const accountBalanceVeryLow = new BN(10).pow(new BN(14));

const defaultState = {
  isReady: false,
  contract: null,
  cachedWalletBalance: new BN(0),
  account: null,
  cachedAccountBalance: new BN(0),
  pendingTransactions: [],
};

const {
  updateContract,
  setAccount,
  setWalletBalance,
  setAccountBalance,
  addPendingTransaction,
  popPendingTransaction,
  sendTransaction
} = createActions({
  UPDATE_CONTRACT: (contract, cachedWalletBalance) => ({ contract, cachedWalletBalance }),
  SET_WALLET_BALANCE: (cachedWalletBalance) => ({ cachedWalletBalance }),
  SET_ACCOUNT: (account) => ({ account }),
  SET_ACCOUNT_BALANCE: (cachedAccountBalance) => ({ cachedAccountBalance }),
  ADD_PENDING_TRANSACTION: (transactionObject, sendOptions, resolve, reject) => ({
    transactionObject,
    sendOptions,
    resolve,
    reject
  }),
  POP_PENDING_TRANSACTION: () => ({}),
  SEND_TRANSACTION: (transactionObject, sendOptions = {}) => ({
    transactionObject,
    sendOptions
  }),
}, { prefix: 'app/miniwallet' });
export { sendTransaction };

export const getContract = async (web3, parentAccount, main) => {
  const walletAddress = await main.methods.miniwalletByUser(parentAccount).call();

  if (web3.utils.toBN(walletAddress).eq(new BN(0))) {
    return null;
  }

  return new web3.eth.Contract(MiniwalletArtifact.abi, walletAddress);
}

export const isOwnerInContract = async (contract, address) => {
  const owners = await contract.methods.getOwners().call();
  return owners.map(owner => owner.toLowerCase()).includes(address.toLowerCase());
}

export const refreshContract = (contract) => async (dispatch, getState) => {
  const { web3, account: parentAccount } = getState().contracts;
  const childAccount = ensureChildAccount(web3, parentAccount).address;

  const walletBalance = web3.utils.toBN(await web3.eth.getBalance(contract.options.address));
  dispatch(updateContract(contract, walletBalance));

  if (await isOwnerInContract(contract, childAccount)) {
    const accountBalance = web3.utils.toBN(await web3.eth.getBalance(childAccount));
    dispatch(setAccount(childAccount));
    dispatch(setAccountBalance(accountBalance));
  }
}

export const recharge = () => async (dispatch, getState) => {
  try {
    const {
      web3,
      account: parentAccount,
      contracts: { main },
    } = getState().contracts;
    let contract = await getContract(web3, parentAccount, main);
    const childAccount = ensureChildAccount(web3, parentAccount).address;
    const walletBalance = contract ? web3.utils.toBN(await web3.eth.getBalance(contract.options.address)) : new BN(0);
    const accountBalance = web3.utils.toBN(await web3.eth.getBalance(childAccount));

    let amountForWallet = walletBalanceRecommended.sub(walletBalance);
    if (amountForWallet.lte(new BN(0))) { amountForWallet = new BN(0); }
    let amountForChild = accountBalanceRecommended.sub(accountBalance);
    if (amountForChild.lte(new BN(0))) { amountForChild = new BN(0); }
    const totalAmount = amountForWallet.add(amountForChild);

    if (!contract) {
      const result = await main.methods.makeMiniwallet().send({ from: parentAccount, gas: 1e7 });
      contract = new web3.eth.Contract(MiniwalletArtifact.abi, result.events.NewMiniwallet.returnValues.wallet);
    }

    await contract.methods.recharge(childAccount, amountForChild.toString()).send({
      from: parentAccount,
      gas: 1e7,
      value: totalAmount.toString()
    });

    await dispatch(refreshContract(contract));
  } catch (e) {
    console.error('recharge error', e);
  }
}

export const initMiniwallet = () => async (dispatch, getState) => {
  const { web3, account: parentAccount, contracts: { main } } = getState().contracts;
  const contract = await getContract(web3, parentAccount, main);

  if (contract) {
    await dispatch(refreshContract(contract));
  }
}

const childKeysKey = 'go-post-app.miniwallet.childKeys';

const getMiniwalletStorage = () => {
  const current = window.localStorage.getItem(childKeysKey);

  if (!current) {
    window.localStorage.setItem(childKeysKey, '{}');
    return {};
  }

  return JSON.parse(current);
};

const getChildKey = (parentAccount) => {
  const storage = getMiniwalletStorage();
  return storage[parentAccount] || null;
};

const setChildKey = (parentAccount, childKey) => {
  const storage = getMiniwalletStorage();
  storage[parentAccount] = childKey;
  window.localStorage.setItem(childKeysKey, JSON.stringify(storage));
};

const ensureChildAccount = (web3, parentAccount) => {
  const childKey = getChildKey(parentAccount);

  if (childKey) {
    return web3.eth.accounts.wallet.add(childKey);
  }

  const newAccount = web3.eth.accounts.create();
  web3.eth.accounts.wallet.add(newAccount);

  setChildKey(parentAccount, newAccount.privateKey);
  return newAccount;
};

const ensureBuffer = () => async (dispatch, getState) => {
  const { web3 } = getState().contracts;
  const state = getState().miniwallet;

  if (state.cachedAccountBalance.lt(accountBalanceLow)) {
    const targetIncrease = accountBalanceRecommended.sub(state.cachedAccountBalance);
    const walletBalance = web3.utils.toBN(await web3.eth.getBalance(state.contract.options.address));
    // TODO: Check if enough funds are available.
    await state.contract.methods.withdraw(state.account, targetIncrease.toString()).send({ gas: 1e5, from: state.account });
    dispatch(setWalletBalance(walletBalance.sub(targetIncrease)));
    dispatch(setAccountBalance(state.cachedAccountBalance.add(targetIncrease)));
  }
}

export const getShouldRecharge = (state) => {
  const {
    miniwallet: {
      contract,
      cachedWalletBalance,
      cachedAccountBalance
    }
  } = state;

  return !contract || cachedWalletBalance.lt(walletBalanceLow) || cachedAccountBalance.lt(accountBalanceVeryLow);
}

export const sendMiddleware = store => next => action => {
  if (typeof action.type !== 'string' || !action.type.startsWith('app/miniwallet/')) {
    return next(action);
  }

  switch (action.type) {
    case 'app/miniwallet/SEND_TRANSACTION':
      return (async () => {
        const { web3 } = store.getState().contracts;
        const state = store.getState().miniwallet;

        const { transactionObject } = action.payload;
        const sendOptions = {
          ...action.payload.sendOptions,
          from: state.account,
        };

        return new Promise(async (resolve, reject) => {
          try {
            const wasEmpty = store.getState().miniwallet.pendingTransactions.length === 0;

            store.dispatch(addPendingTransaction(transactionObject, sendOptions, resolve, reject));

            if (!wasEmpty) {
              return;
            }

            let pending = null;
            while (true) {
              pending = store.getState().miniwallet.pendingTransactions;
              if (pending.length === 0) {
                return;
              }

              const { transactionObject, sendOptions, resolve, reject } = pending[0];
              store.dispatch(popPendingTransaction());

              await store.dispatch(ensureBuffer());

              try {
                const result = await transactionObject.send(sendOptions);

                const [walletBalance, accountBalance] = (await Promise.all([
                  web3.eth.getBalance(state.contract.options.address),
                  web3.eth.getBalance(state.account),
                ])).map(num => web3.utils.toBN(num));
                store.dispatch(setWalletBalance(walletBalance));
                store.dispatch(setAccountBalance(accountBalance));

                resolve(result);
              } catch (e) {
                reject(e);
              }
            }
          } catch (e) {
            reject(e);
          }
        });
      })();
    default:
      return next(action);
  }
}

const reducer = handleActions(
  {
    [updateContract]: (state, { payload: { contract, cachedWalletBalance } }) => ({ ...state, contract, cachedWalletBalance }),
    [setAccount]: (state, { payload: { account } }) => ({ ...state, account, }),
    [setWalletBalance]: (state, { payload: { cachedWalletBalance } }) => ({ ...state, cachedWalletBalance }),
    [setAccountBalance]: (state, { payload: { cachedAccountBalance } }) => ({ ...state, cachedAccountBalance }),
    [addPendingTransaction]: (state, { payload: { transactionObject, sendOptions, resolve, reject } }) => ({
      ...state,
      pendingTransactions: [
        ...state.pendingTransactions,
        {
          transactionObject,
          sendOptions,
          resolve,
          reject,
        },
      ],
    }),
    [popPendingTransaction]: (state) => ({
      ...state,
      pendingTransactions: [
        ...state.pendingTransactions.slice(1),
      ],
    }),
  },
  defaultState
);

export default reducer;
