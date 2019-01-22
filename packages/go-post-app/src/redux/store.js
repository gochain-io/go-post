// @flow

import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'

import reducer from './reducer';
import { sendMiddleware } from './miniwallet';

export const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(
    sendMiddleware,
    thunkMiddleware
  ))
);
