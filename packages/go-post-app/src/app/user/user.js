import BN from 'bn.js';
import { createActions, handleActions } from 'redux-actions';
import Web3 from 'web3';

const defaultState = {
  error: null,
  isFetched: false,
  username: null,
  posts: null,
};

const { fetched, addPost, fail } = createActions({
  FETCHED: (username, posts) => ({ username, posts }),
  ADD_POST: (post) => ({ post }),
  FAIL: (error) => ({ error }),
}, { prefix: 'app/user' });

export const fetchPosts = (username) => async (dispatch, getState) => {
  try {
    const { account, contracts: { main } } = getState().contracts;
    await dispatch(unsubscribeToPosts());

    await main.methods.setUsername('test').send({ from: account });

    let userAddress = await main.methods.getUserByUsername(username).call();

    if (Web3.utils.toBN(userAddress).isZero()) {
      userAddress = null;
    }

    if (userAddress) {
      await dispatch(subscribeToPosts(userAddress));

      const posts = await main.methods.getPostsByUser(userAddress).call();
      dispatch(fetched(username, posts));
    } else {
      dispatch(fetched(username, null));
    }
  } catch (e) {
    dispatch(fail(e));
  }
}

let postsListener = null;

const subscribeToPosts = (user) => async (dispatch, getState) => {
  try {
    const main = getState().contracts.contracts.main;

    postsListener = main.events.NewPost({
      filter: { user },
    }, (e, event) => {
      if (e) {
        console.error('Post subscribe error', e);
        return;
      }

      dispatch(addPost(event.returnValues.post));
    });
  } catch (e) {
    console.error('Post subscribe error', e);
  }
}

export const unsubscribeToPosts = () => async (dispatch, getState) => {
  if (postsListener) {
    postsListener.removeAllListeners();
    postsListener = null;
  }
}

export const makePost = (content) => async (dispatch, getState) => {
  const { account, contracts: { main } } = getState().contracts;
  const result = await main.methods.makePost(content).send({ from: account, gas: 5e5 });
}

const reducer = handleActions(
  {
    [fetched]: (state, { payload: { username, posts } }) => ({
      ...state,
      isFetched: true,
      username,
      posts
    }),
    [addPost]: (state, { payload: { post } }) => ({
      ...state,
      posts: [...state.posts, post]
    }),
    [fail]: (state, { payload: { error } }) => ({ ...defaultState, error }),
  },
  defaultState
);

export default reducer;
