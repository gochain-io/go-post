export const NETWORK_MAIN = '1';
export const NETWORK_TEST = '31337';

export default (networkId) => ({
  [NETWORK_MAIN]: {
    name: 'GoChain Main Network',
    url: 'https://rpc.gochain.io'
  },
  [NETWORK_TEST]: {
    name: 'GoChain Test Network',
    url: 'https://testnet-rpc.gochain.io'
  },
  local: {
    name: 'Localhost',
    url: 'http://localhost:8545'
  }
}[networkId]);
