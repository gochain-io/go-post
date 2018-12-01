import MainContract from './build/contracts/MainContract';

export { MainContract as MainContractArtifact };

const getDeployedContract = artifact => (web3, networkId) => {
  const deployedAddress = artifact.networks[networkId].address;
  const instance = new web3.eth.Contract(artifact.abi, deployedAddress);
  return instance;
}

export const getMainContract = getDeployedContract(MainContract);
