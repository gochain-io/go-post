// @flow

import BN from 'bn.js';
import { createActions, handleActions } from 'redux-actions';
import Web3 from 'web3';
import { sendTransaction } from '../../redux/miniwallet';

const defaultState = {
  error: null,
  isFetched: false,
  user: null,
  userAddress: null,
  posts: null,
  tippingPostId: null,
  isPosting: false,
};

const { fetched, addPost, fail, setLikePending, setLiked, startTip, closeTipPrompt, setTipPending, addTip, setIsPosting } = createActions({
  FETCHED: (user, userAddress, posts) => ({ user, userAddress, posts }),
  ADD_POST: (post) => ({ post }),
  FAIL: (error) => ({ error }),
  SET_LIKE_PENDING: (postId, likePending) => ({ postId, likePending }),
  SET_LIKED: (liker, postId, liked) => ({ liker, postId, liked }),
  START_TIP: (tippingPostId) => ({ tippingPostId }),
  CLOSE_TIP_PROMPT: () => ({}),
  SET_TIP_PENDING: (postId, tipPending) => ({ postId, tipPending }),
  ADD_TIP: (postId, tip) => ({ postId, tip }),
  SET_IS_POSTING: (isPosting) => ({ isPosting }),
}, { prefix: 'app/user' });
export { startTip, closeTipPrompt };

const processNewPost = post => ({
  post,
  likePending: false,
  tipPending: false,
});

export const fetchPosts = (user) => async (dispatch, getState) => {
  try {
    const { account, contracts: { main } } = getState().contracts;
    await dispatch(unsubscribeToPosts());

    let userAddress = null;

    if (Web3.utils.isAddress(user)) {
      userAddress = user;
    } else {
      const address = await main.methods.getUserByUsername(user).call();
      if (!Web3.utils.toBN(address).isZero()) {
        userAddress = address;
      }
    }

    if (userAddress) {
      await dispatch(subscribeToPosts(userAddress));

      let posts = await main.methods.getPostsByUser(userAddress).call();
      posts = posts.map(processNewPost);
      dispatch(fetched(user, userAddress, posts));
    } else {
      dispatch(fetched(user, userAddress, null));
    }
  } catch (e) {
    console.error('fetch error', e);
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

      dispatch(addPost(processNewPost(event.returnValues.post)));
    });
  } catch (e) {
    console.error('Post subscribe error', e);
  }
}

export const unsubscribeToPosts = () => async (dispatch, getState) => {
  if (postsListener) {
    postsListener.unsubscribe();
    postsListener = null;
  }
}

export const makePost = (content) => async (dispatch, getState) => {
  const { account, contracts: { main } } = getState().contracts;

  try {
    dispatch(setIsPosting(true));
    const result = await dispatch(sendTransaction(main.methods.makePost(account, content), { gas: 3e6 }));
    dispatch(addPost(processNewPost(result.events.NewPost.returnValues.post)));
  } catch(e) {
    console.error('error saving post', e);
  } finally {
    dispatch(setIsPosting(false));
  }
}

const getPostIndexById = (posts, postId) => {
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].post.id === postId) {
      return i;
    }
  }

  return null;
};

export const getPostById = (posts, postId) => {
  return posts[getPostIndexById(posts, postId)];
}

export const isPostLikedByUser = (post, user) => {
  return post.post.likes.map(like => like.addr.toLowerCase()).includes(user.toLowerCase());
};

export const toggleLike = (postId) => async (dispatch, getState) => {
  dispatch(setLikePending(postId, true));

  try {
    const {
      user: { posts },
      contracts: { account: parentAccount, contracts: { main } },
    } = getState();

    const postIndex = getPostIndexById(posts, postId);
    const post = posts[postIndex];
    const likedByMe = isPostLikedByUser(post, parentAccount);

    if (likedByMe) {
      await dispatch(sendTransaction(
        main.methods.unlikePost(parentAccount, postId),
        { gas: 1e6 },
      ));
      dispatch(setLiked(parentAccount, postId, false));
    } else {
      await dispatch(sendTransaction(
        main.methods.likePost(parentAccount, postId),
        { gas: 1e6 },
      ));
      dispatch(setLiked(parentAccount, postId, true));
    }
  } catch (e) {
    console.error('Like error', e);
  } finally {
    dispatch(setLikePending(postId, false));
  }
}

export const isPostTippedByUser = (post, user) => {
  return post.post.tips.map(tip => tip.fromUser.addr.toLowerCase()).includes(user.toLowerCase());
};

export const tip = (postId, amount) => async (dispatch, getState) => {
  dispatch(closeTipPrompt());
  dispatch(setTipPending(postId, true));

  try {
    const {
      contracts: { account: parentAccount, contracts: { main } },
      user: { posts },
    } = getState();

    const post = getPostById(posts, postId);
    const tip = {
      fromUser: parentAccount,
      toUser: post.post.user.addr,
      forPost: post.post.id,
      amount: amount,
    }

    // We send from parentAccount since the miniwallet account won't have enough funds for tipping.
    const result = await main.methods.tipPost(parentAccount, post.post.id).send({
      from: parentAccount,
      value: tip.amount.toString(),
      gas: 1e6
    });

    dispatch(addTip(postId, {
      ...tip,
      // TODO: Use usernames.
      fromUser: { addr: tip.fromUser, username: '' },
      toUser: { addr: tip.toUser, username: '' },
    }));
  } catch (e) {
    console.error('tipping error', e);
  } finally {
    dispatch(setTipPending(postId, false));
  }
};

const formatPosts = posts => {
  const usedIds = {};
  let newPosts = [];
  posts.forEach(post => {
    const id = post.post.id;
    if (!usedIds[id]) {
      usedIds[id] = true;
      newPosts.push(post);
    }
  });

  newPosts.sort((p1, p2) => p2.post.time - p1.post.time);
  return newPosts;
};

const ensureLike = (likes, account, liked) => {
  if (liked) {
    if (likes.map(like => like.addr).includes(account)) {
      return likes;
    } else {
      return [...likes, { addr: account, username: '' }] // TODO: Use our username here
    }
  } else {
    return likes.filter(like => like.addr !== account);
  }
};

const reducer = handleActions(
  {
    [fetched]: (state, { payload: { user, userAddress, posts } }) => ({
      ...state,
      isFetched: true,
      user,
      userAddress,
      posts: posts ? formatPosts(posts) : null,
    }),
    [addPost]: (state, { payload: { post } }) => ({
      ...state,
      posts: formatPosts([...state.posts, post]),
    }),
    [fail]: (state, { payload: { error } }) => ({ ...defaultState, error }),
    [setLikePending]: (state, { payload: { postId, likePending } }) => ({
        ...state,
        posts: state.posts.map(post => {
          if (post.post.id === postId) {
            return {
              ...post,
              likePending,
            };
          }

          return post;
        })
    }),
    [setLiked]: (state, { payload: { liker, postId, liked } }) => {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.post.id === postId) {
            return {
              ...post,
              post: {
                ...post.post,
                likes: ensureLike(post.post.likes, liker, liked),
              }
            };
          }

          return post;
        })
      };
    },
    [startTip]: (state, { payload: { tippingPostId } }) => ({ ...state, tippingPostId }),
    [closeTipPrompt]: (state) => ({ ...state, tippingPostId: null }),
    [setTipPending]: (state, { payload: { postId, tipPending } }) => ({
      ...state,
      posts: state.posts.map(post => {
        if (post.post.id === postId) {
          return {
            ...post,
            tipPending,
          };
        }

        return post;
      })
    }),
    [addTip]: (state, { payload: { postId, tip } }) => {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.post.id === postId) {
            return {
              ...post,
              post: {
                ...post.post,
                tips: [...post.post.tips, tip],
              }
            };
          }

          return post;
        })
      };
    },
    [setIsPosting]: (state,  { payload: { isPosting } }) => ({ ...state, isPosting }),
  },
  defaultState
);

export default reducer;
