export const NETWORK_MAIN = '60';
export const NETWORK_TEST = '31337';

var localhost_ = 'localhost'; 
if (/\bCrOS\b/.test(navigator.userAgent)) {
  // yes, it is (probably, if no one's mucked about with their user agent string)
  localhost_ = 'penguin.linux.test';
}
const localNodeIP = process.env.REACT_APP_LOCAL_NODE_IP || localhost_;

export default (networkId) => ({
  [NETWORK_MAIN]: {
    name: 'Main Network',
    url: 'https://rpc.gochain.io',
  },
  [NETWORK_TEST]: {
    name: 'Test Network',
    url: 'https://testnet-rpc.gochain.io',
  },
  local: {
    name: 'Local Network',
    url: `http://${localNodeIP}:8545`,
  },
}[networkId]);
