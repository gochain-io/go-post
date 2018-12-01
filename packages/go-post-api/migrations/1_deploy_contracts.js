const MainContract = artifacts.require('./MainContract.sol');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(MainContract);
}
