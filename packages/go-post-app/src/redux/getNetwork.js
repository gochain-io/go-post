export const NETWORK_MAIN = '60';
export const NETWORK_TEST = '31337';

const localNodeIP = process.env.REACT_APP_LOCAL_NODE_IP || '127.0.0.1';

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
    url: `ws://${localNodeIP}:8546`,
  },
}[networkId]);
