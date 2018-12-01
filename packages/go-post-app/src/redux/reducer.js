import { combineReducers } from 'redux';

import contracts from './contracts';
import user from '../app/user/user';

export default combineReducers({
  contracts,
  user,
});
