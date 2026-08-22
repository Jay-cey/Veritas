const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Deployer Address:", signer.address);

  // Check testnet balance
  const testnetProvider = new hre.ethers.JsonRpcProvider("https://rpc.bohr.life");
  const testnetBal = await testnetProvider.getBalance(signer.address);
  console.log(`Testnet Balance: ${hre.ethers.formatEther(testnetBal)} BOT`);

  // Check mainnet balance
  const mainnetProvider = new hre.ethers.JsonRpcProvider("https://rpc.botchain.ai");
  const mainnetBal = await mainnetProvider.getBalance(signer.address);
  console.log(`Mainnet Balance: ${hre.ethers.formatEther(mainnetBal)} BOT`);
}

main().catch(console.error);
