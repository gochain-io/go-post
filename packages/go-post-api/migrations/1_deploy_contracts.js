const AddressToString = artifacts.require('./AddressToString.sol');
const MainContract = artifacts.require('./MainContract.sol');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(AddressToString);
  deployer.link(AddressToString, MainContract);
  deployer.deploy(MainContract);
}
