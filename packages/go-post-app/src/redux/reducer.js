// @flow

import { combineReducers } from 'redux';

import contracts from './contracts';
import miniwallet from './miniwallet';
import user from '../app/user/user';

export default combineReducers({
  contracts,
  miniwallet,
  user,
});
