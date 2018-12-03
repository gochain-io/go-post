const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const getDeployKey = () => {
  const keyFile = require('./deploy-key.json');
  return keyFile.mnemonic;
};

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      // FIXME: Uses Ethereum's HD path.
      provider: () => new HDWalletProvider(getDeployKey(), 'https://testnet-rpc.gochain.io'),
      network_id: "*", // Match any network id
      gas: 2e7,
      gasPrice: 4e9
    },
    main: {
      // FIXME: Uses Ethereum's HD path.
      provider: () => new HDWalletProvider(getDeployKey(), 'https://rpc.gochain.io'),
      network_id: "*", // Match any network id
      gas: 2e7,
      gasPrice: 4e9
    }
  }
};
