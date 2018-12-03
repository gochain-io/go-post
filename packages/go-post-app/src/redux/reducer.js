// @flow

import { combineReducers } from 'redux';

import contracts from './contracts';
import miniwallet from './miniwallet';
import profile from '../app/profile/profile';
import user from '../app/user/user';

export default combineReducers({
  contracts,
  miniwallet,
  profile,
  user,
});
