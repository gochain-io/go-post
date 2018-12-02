import MainContract from './build/contracts/MainContract';
import Miniwallet from './build/contracts/Miniwallet';

export {
  MainContract as MainContractArtifact,
  Miniwallet as MiniwalletArtifact,
};

const getDeployedContract = artifact => (web3, networkId) => {
  const deployedAddress = artifact.networks[networkId].address;
  const instance = new web3.eth.Contract(artifact.abi, deployedAddress);
  return instance;
}

export const getMainContract = getDeployedContract(MainContract);
