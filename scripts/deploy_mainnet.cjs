const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  
  if (chainId !== 677) {
    throw new Error(`This script is only intended for BOT Chain Mainnet (Chain ID 677). Current Chain ID: ${chainId}`);
  }

  console.log("=================================================");
  console.log(" Deploying VeritasRWA Remaining Contracts on MAINNET");
  console.log(" Chain ID:", chainId);
  console.log("=================================================");

  const [signer] = await hre.ethers.getSigners();
  console.log("Deployer Wallet:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} BOT`);

  // Existing Mainnet Vault Address
  const vaultAddress = "0x451833163606ff8dc51e4CEc7894306A54507893";
  console.log("✔ Reusing existing VeritasAssetVault at:", vaultAddress);

  // Attach to existing VeritasAssetVault
  const VeritasAssetVault = await hre.ethers.getContractFactory("VeritasAssetVault");
  const vault = await VeritasAssetVault.attach(vaultAddress);

  // Check if owner is correct
  const vaultOwner = await vault.owner();
  if (vaultOwner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Deployer is not the owner of VeritasAssetVault. Vault Owner: ${vaultOwner}`);
  }

  // 1. Deploy AIAgentYieldManager
  console.log("\nDeploying AIAgentYieldManager...");
  const AIAgentYieldManager = await hre.ethers.getContractFactory("AIAgentYieldManager");
  const aiAgentManager = await AIAgentYieldManager.deploy(vaultAddress);
  await aiAgentManager.waitForDeployment();
  const aiAgentAddress = await aiAgentManager.getAddress();
  console.log("✔ AIAgentYieldManager deployed to:", aiAgentAddress);

  // 2. Link AI Agent Manager to Vault
  console.log("Linking AIAgentYieldManager to VeritasAssetVault...");
  const txLink = await vault.setAIAgentManager(aiAgentAddress);
  await txLink.wait();
  console.log("✔ Linked AIAgentYieldManager to VeritasAssetVault");

  // 3. Deploy Fractional RWA Tokens
  const RWA_TOKENS = [
    { id: "asset-gpu-1", name: "Manhattan DePIN GPU Fraction", symbol: "vGPU", supply: 90000, ipfs: "0x8f4d92a1c9e83b5f72e19d44a106e23194a8c2f1e", oracle: "ZK-GPU-Oracle" },
    { id: "asset-solar-1", name: "Sahara CyberGrid Solar Fraction", symbol: "vSOLAR", supply: 106666, ipfs: "0x3c7e9112f458a0b943d21e5f88c7a102e9f3b145", oracle: "DePIN-Energy-Oracle" },
    { id: "asset-re-1", name: "Tokyo Ginza Tower Fraction", symbol: "vREAL", supply: 68000, ipfs: "0x12a9e884f3c7b2a9d8011c4e7f3b52a19e048c1f", oracle: "Deloitte-SPV-Auditor" },
    { id: "asset-tbill-1", name: "US Treasury Reserve Fraction", symbol: "vTBILL", supply: 500000, ipfs: "0x99e821a4f00b12c84d632a77f11e9a2b58c701d4", oracle: "BNY-Mellon-Attest" }
  ];

  const deployedTokens = {};
  const VeritasFraction = await hre.ethers.getContractFactory("VeritasFraction");

  console.log("\nDeploying Fractional RWA Tokens...");
  for (const rwa of RWA_TOKENS) {
    console.log(`Deploying ${rwa.name} (${rwa.symbol})...`);
    const fraction = await VeritasFraction.deploy(rwa.name, rwa.symbol, rwa.supply, rwa.ipfs, rwa.oracle);
    await fraction.waitForDeployment();
    const fractionAddr = await fraction.getAddress();
    console.log(`✔ Deployed ${rwa.symbol} Token to: ${fractionAddr}`);

    console.log(`  Setting vault for ${rwa.symbol}...`);
    const txSetVault = await fraction.setVault(vaultAddress);
    await txSetVault.wait();

    console.log(`  Registering ${rwa.symbol} in VeritasAssetVault...`);
    const txRegister = await vault.registerAsset(fractionAddr);
    await txRegister.wait();
    console.log(`  └ Registered ${rwa.symbol} in Vault`);

    deployedTokens[rwa.id] = fractionAddr;
  }

  // 4. Fund the Vault with 0.1 BOT
  console.log("\nFunding VeritasAssetVault with 0.1 BOT...");
  const fundAmount = hre.ethers.parseEther("0.1");
  const txFund = await signer.sendTransaction({
    to: vaultAddress,
    value: fundAmount
  });
  await txFund.wait();
  console.log("✔ Funded VeritasAssetVault with 0.1 BOT");

  // Verify Vault balance
  const vaultBalance = await hre.ethers.provider.getBalance(vaultAddress);
  console.log(`Vault Balance: ${hre.ethers.formatEther(vaultBalance)} BOT`);

  // Save manifest file for frontend consumption
  const deploymentManifest = {
    network: "mainnet",
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
  console.log("🎉 VERITAS RWA CONTRACTS DEPLOYED SUCCESSFULLY ON MAINNET");
  console.log(`Explorer: https://scan.botchain.ai`);
  console.log("=================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
