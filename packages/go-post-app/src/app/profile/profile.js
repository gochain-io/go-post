import { createActions, handleActions } from 'redux-actions';

import { sendTransaction } from '../../redux/miniwallet';

const defaultState = {
  username: null,
  isFetched: false,
  didSetUsername: false,
  isSaving: false,
};

const {
  setUsername,
  setDidSetUsername,
  setIsSaving,
} = createActions({
  SET_USERNAME: (username) => ({ username }),
  SET_IS_SAVING: (isSaving) => ({ isSaving }),
  SET_DID_SET_USERNAME: (didSetUsername) => ({ didSetUsername }),
}, { prefix: 'app/profile' });
export { setDidSetUsername };

export const saveUsername = (username) => async (dispatch, getState) => {
  try {
    const {
      contracts: {
        contracts: { main },
        account: parentAccount,
      },
    } = getState();

    dispatch(setIsSaving(true))
    await dispatch(sendTransaction(
      main.methods.setUsername(parentAccount, username),
      { gas: 1e6 }
    ));
    dispatch(setUsername(username));
    dispatch(setIsSaving(false));
    await dispatch(setDidSetUsername(true));
  } catch (e) {
    console.error('save username error', e);
  }
};

export const fetchUsername = () => async (dispatch, getState) => {
  try {
    const {
      contracts: {
        contracts: { main },
        account: parentAccount,
      }
    } = getState();

    const username = await main.methods.usernameByUser(parentAccount).call() || null;
    dispatch(setUsername(username));
  } catch (e) {
    console.error('fetch username error', e);
  }
};

export const initProfile = () => async (dispatch, getState) => {
  await dispatch(fetchUsername());
}

const reducer = handleActions(
  {
    [setUsername]: (state, { payload: { username } }) => ({
      ...state,
      isFetched: true,
      username,
    }),
    [setIsSaving]: (state, { payload: { isSaving } }) => ({ ...state, isSaving }),
    [setDidSetUsername]: (state, { payload: { didSetUsername } }) => ({ ...state, didSetUsername }),
  },
  defaultState
);

export default reducer;
