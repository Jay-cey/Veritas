const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = chainId === 968 ? "testnet" : chainId === 677 ? "mainnet" : "local";

  console.log("=================================================");
  console.log(` Deploying VeritasRWA Contracts to BOT Chain [${networkName.toUpperCase()}]`);
  console.log(" Chain ID:", chainId);
  console.log("=================================================");

  // Token address defaults
  const USDT_ADDRESS = chainId === 968 
    ? "0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C" 
    : "0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C";

  // 1. Deploy VeritasAssetVault
  let vaultAddress = process.env.EXISTING_VAULT_ADDRESS;
  let vault;
  const VeritasAssetVault = await hre.ethers.getContractFactory("VeritasAssetVault");

  if (vaultAddress) {
    console.log("✔ Reusing existing VeritasAssetVault at:", vaultAddress);
    vault = await VeritasAssetVault.attach(vaultAddress);
  } else {
    vault = await VeritasAssetVault.deploy(USDT_ADDRESS);
    await vault.waitForDeployment();
    vaultAddress = await vault.getAddress();
    console.log("✔ VeritasAssetVault deployed to:", vaultAddress);
  }

  // 2. Deploy AIAgentYieldManager
  const AIAgentYieldManager = await hre.ethers.getContractFactory("AIAgentYieldManager");
  
  let deployOptions = {};
  if (networkName === "mainnet") {
    const signer = (await hre.ethers.getSigners())[0];
    const balance = await hre.ethers.provider.getBalance(signer.address);
    const balanceBOT = Number(hre.ethers.formatEther(balance));
    console.log(`Deployer balance: ${balanceBOT} BOT`);
    
    if (balanceBOT < 0.012) {
      console.log("⚠️ Balance is low. Attempting to deploy with lowered gasPrice (12 gwei) to fit within balance...");
      deployOptions.gasPrice = hre.ethers.parseUnits("12", "gwei");
    }
  }

  const aiAgentManager = await AIAgentYieldManager.deploy(vaultAddress, deployOptions);
  await aiAgentManager.waitForDeployment();
  const aiAgentAddress = await aiAgentManager.getAddress();
  console.log("✔ AIAgentYieldManager deployed to:", aiAgentAddress);

  // 3. Link AI Agent Manager to Vault
  await vault.setAIAgentManager(aiAgentAddress);
  console.log("✔ Linked AIAgentYieldManager to VeritasAssetVault");

  // 4. Deploy Sample Fractional RWA Tokens
  const RWA_TOKENS = [
    { id: "asset-gpu-1", name: "Manhattan DePIN GPU Fraction", symbol: "vGPU", supply: 90000, ipfs: "0x8f4d92a1c9e83b5f72e19d44a106e23194a8c2f1e", oracle: "ZK-GPU-Oracle" },
    { id: "asset-solar-1", name: "Sahara CyberGrid Solar Fraction", symbol: "vSOLAR", supply: 106666, ipfs: "0x3c7e9112f458a0b943d21e5f88c7a102e9f3b145", oracle: "DePIN-Energy-Oracle" },
    { id: "asset-re-1", name: "Tokyo Ginza Tower Fraction", symbol: "vREAL", supply: 68000, ipfs: "0x12a9e884f3c7b2a9d8011c4e7f3b52a19e048c1f", oracle: "Deloitte-SPV-Auditor" },
    { id: "asset-tbill-1", name: "US Treasury Reserve Fraction", symbol: "vTBILL", supply: 500000, ipfs: "0x99e821a4f00b12c84d632a77f11e9a2b58c701d4", oracle: "BNY-Mellon-Attest" }
  ];

  const deployedTokens = {};

  if (networkName !== "mainnet") {
    console.log("\nDeploying Fractional RWA Tokens...");
    const VeritasFraction = await hre.ethers.getContractFactory("VeritasFraction");
    for (const rwa of RWA_TOKENS) {
      const fraction = await VeritasFraction.deploy(rwa.name, rwa.symbol, rwa.supply, rwa.ipfs, rwa.oracle);
      await fraction.waitForDeployment();
      const fractionAddr = await fraction.getAddress();
      console.log(`✔ Deployed ${rwa.symbol} Token to: ${fractionAddr}`);

      await fraction.setVault(vaultAddress);
      await vault.registerAsset(fractionAddr);
      console.log(`  └ Registered ${rwa.symbol} in Vault`);

      deployedTokens[rwa.id] = fractionAddr;
    }
  } else {
    console.log("\nSkipping Fractional RWA Token deployment on Mainnet per user instruction.");
  }

  // Save manifest file for frontend consumption
  const deploymentManifest = {
    network: networkName,
    chainId: chainId,
    timestamp: new Date().toISOString(),
    vault: vaultAddress,
    aiAgentManager: aiAgentAddress,
    tokens: deployedTokens
  };

  const outputPath = path.join(__dirname, "../src/constants/deployedContracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentManifest, null, 2));
  console.log(`\n✔ Saved deployment manifest to src/constants/deployedContracts.json`);

  console.log("\n=================================================");
  console.log("🎉 VERITAS RWA CONTRACTS DEPLOYED SUCCESSFULLY");
  console.log(`Explorer: ${chainId === 968 ? "https://scan.bohr.life" : "https://scan.botchain.ai"}`);
  console.log("=================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
