import moment from 'moment';
import Web3 from 'web3';

export const formatUser = (user) => {
  if (Web3.utils.isAddress(user)) {
    return user.substring(0, 6) + '...' + user.slice(-6);
  }

  return user;
};

export const formatTimestamp = (timestamp) => {
  const date = moment.unix(timestamp);

  if (date.diff(moment.now(), 'days') >= 1) {
    return date.format('ll');
  }

  return date.fromNow();
};

export const userViewToString = (user) => {
  if (user.username) {
    return user.username;
  }

  return user.addr;
};
