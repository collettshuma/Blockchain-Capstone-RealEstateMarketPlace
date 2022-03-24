// migrating the appropriate contracts
var Verifier = artifacts.require("./Verifier.sol");
var VukaToken = artifacts.require("./VukaToken.sol");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = async (deployer) => {
  await deployer.deploy(Verifier);
  await deployer.deploy(VukaToken, "VukaToken", "VKT");
  await deployer.deploy(SolnSquareVerifier, Verifier.address, "VukaToken", "VKT" );
};
