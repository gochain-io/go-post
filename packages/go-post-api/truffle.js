const PrivateKeyProvider = require("truffle-privatekey-provider");
const Web3 = require('web3');

const getPrivateKey = () => {
  let privateKey = process.env.WEB3_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('WEB3_PRIVATE_KEY environment variable must be set before deploying to external networks.');
  }
  return privateKey.replace('0x', '');
}

const localNodeIP = process.env.LOCAL_NODE_IP || '127.0.0.1';

module.exports = {
  networks: {
    development: {
      host: localNodeIP,
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      provider: () => new PrivateKeyProvider(getPrivateKey(), 'https://testnet-rpc.gochain.io'),
      network_id: "*", // Match any network id
      gas: 2e7,
      gasPrice: 4e9
    },
    main: {
      provider: () => new PrivateKeyProvider(getPrivateKey(), 'https://rpc.gochain.io'),
      network_id: "*", // Match any network id
      gas: 2e7,
      gasPrice: 4e9
    }
  }
};
