// @flow

import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'

import reducer from './reducer';
import { sendMiddleware } from './miniwallet';

// const logger = store => next => action => {
//   console.log('dispatching', action);
//   let result = next(action);
//   console.log('logger result', result);
//   console.log('next state', store.getState());
//   return result;
// }

export const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(
    // logger,
    sendMiddleware,
    thunkMiddleware
  ))
);
