const Web3 = require("web3");

// Use globally injected web3 to find the currentProvider and wrap with web3 v1.0.
const getWeb3 = () => {
  const newWeb3 = new Web3(web3.currentProvider);
  return newWeb3;
}

module.exports = { getWeb3 };
