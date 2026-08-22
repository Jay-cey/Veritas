import { RWAAsset } from '../types';
import deployedContracts from './deployedContracts.json';

// Dynamically read environment variable (VITE_NETWORK='testnet' | 'mainnet')
const envNetwork = (((import.meta as any).env && (import.meta as any).env.VITE_NETWORK) || 'testnet').toLowerCase();
export const ACTIVE_NETWORK_KEY: 'testnet' | 'mainnet' = envNetwork === 'mainnet' ? 'mainnet' : 'testnet';

export const BOT_CHAIN_PARAMS = {
  testnet: {
    chainId: 968,
    hexChainId: '0x3C8',
    chainName: 'BOT Chain Testnet',
    rpcUrl: 'https://rpc.bohr.life',
    nativeCurrency: {
      name: 'BOT',
      symbol: 'BOT',
      decimals: 18,
    },
    blockExplorerUrl: 'https://scan.bohr.life',
    faucetUrl: 'https://faucet.botchain.ai',
    bundlerRpc: 'https://bundler.bohr.life/rpc',
    dexRouter: '0x73Be0A1d8011B335A7aBeF6c45544E8ca4448AB5',
    usdtContract: '0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C',
    wbotContract: '0xD5452816194a3784dBa983426cCe7c122F4abd30',
    vaultContract: (deployedContracts.network === 'testnet' ? deployedContracts.vault : '') || '0xE54c9Bd3D1C97518F2554be85a099EFE23556506',
    aiAgentContract: (deployedContracts.network === 'testnet' ? deployedContracts.aiAgentManager : '') || '0xeD732ea8E05033ebe4b357E69019f5ba7b9cD6f0'
  },
  mainnet: {
    chainId: 677,
    hexChainId: '0x2A5',
    chainName: 'BOT Chain Mainnet',
    rpcUrl: 'https://rpc.botchain.ai',
    nativeCurrency: {
      name: 'BOT',
      symbol: 'BOT',
      decimals: 18,
    },
    blockExplorerUrl: 'https://scan.botchain.ai',
    faucetUrl: 'https://faucet.botchain.ai',
    bundlerRpc: 'https://bundler.botchain.ai/rpc',
    dexRouter: '0xaE6ae8630f7A888dEc0B9195C85F7515d5887655',
    usdtContract: '0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C',
    wbotContract: '0xD5452816194a3784dBa983426cCe7c122F4abd30',
    vaultContract: (deployedContracts.network === 'mainnet' ? deployedContracts.vault : '') || '0x451833163606ff8dc51e4CEc7894306A54507893',
    aiAgentContract: (deployedContracts.network === 'mainnet' ? deployedContracts.aiAgentManager : '') || '0xeD732ea8E05033ebe4b357E69019f5ba7b9cD6f0'
  }
};

export const getActiveNetworkParams = () => {
  return BOT_CHAIN_PARAMS[ACTIVE_NETWORK_KEY];
};

export const BOT_PRICE_API = 'https://api.coinstore.com/api/v1/ticker/price;symbol=BOTUSDT';

export const SAMPLE_RWA_ASSETS: RWAAsset[] = [
  {
    id: 'asset-gpu-1',
    name: 'Manhattan DePIN H100 GPU Supercluster',
    category: 'depin_gpu',
    categoryName: 'DePIN AI Compute',
    location: 'New York, USA',
    totalValueUSD: 4500000,
    fractionPriceBOT: 0.1,
    fractionPriceUSDT: 0.02,
    totalFractions: 45000000,
    availableFractions: 15700000,
    apy: 14.2,
    image: '/assets/depin_gpu.png',
    riskScore: 'AA+',
    telemetryType: 'GPU Load & Compute',
    telemetryCurrentValue: '94.8',
    telemetryUnit: '% Utilization',
    verifier: 'Compute Telemetry Oracle',
    spvDocumentHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    contractAddress: deployedContracts.tokens['asset-gpu-1'] || '0x546307af427902A75771434Df831d88219784E19',
    description: 'High-density cluster of 256 NVIDIA H100 SXM5 GPUs dedicated to compute workloads and inference tasks on BOT Chain. Earns real-time rental yield paid per compute second.',
    features: [
      '24/7 Real-Time Hardware Telemetry',
      'Direct API Rental Revenue Stream',
      'Automated Monthly BOT Buyback',
      'Insured Hardware SPV Vault'
    ]
  },
  {
    id: 'asset-solar-1',
    name: 'Sahara CyberGrid Solar Farm Phase II',
    category: 'solar_farm',
    categoryName: 'Green DePIN Energy',
    location: 'Atacama, Chile',
    totalValueUSD: 3200000,
    fractionPriceBOT: 0.08,
    fractionPriceUSDT: 0.016,
    totalFractions: 40000000,
    availableFractions: 15800000,
    apy: 11.8,
    image: '/assets/solar_farm.png',
    riskScore: 'AAA',
    telemetryType: 'Power Output (kW)',
    telemetryCurrentValue: '4,820',
    telemetryUnit: 'kW Output',
    verifier: 'Solar Energy Telemetry Feed',
    spvDocumentHash: 'QmZtrP69WnZg4n2yG8mZ6H4W1yR9bK8m3n2v1x9y8z7w6',
    contractAddress: deployedContracts.tokens['asset-solar-1'] || '0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419',
    description: '50MW solar energy generation infrastructure feeding power to regional data centers. Smart IoT energy meters transmit verifiable generation data onto BOT Chain.',
    features: [
      'On-Chain IoT Energy Metering',
      '15-Year Guaranteed Off-Take PPA',
      'Verified Carbon Offset Attributes',
      'Dynamic Energy Pricing Router'
    ]
  },
  {
    id: 'asset-re-1',
    name: 'Tokyo Ginza Financial Center Tower',
    category: 'real_estate',
    categoryName: 'Institutional Real Estate',
    location: 'Ginza, Tokyo, Japan',
    totalValueUSD: 6800000,
    fractionPriceBOT: 0.12,
    fractionPriceUSDT: 0.024,
    totalFractions: 56666666,
    availableFractions: 16250000,
    apy: 8.5,
    image: '/assets/tokyo_tower.png',
    riskScore: 'AAA',
    telemetryType: 'Occupancy Rate',
    telemetryCurrentValue: '98.5',
    telemetryUnit: '% Occupancy',
    verifier: 'SPV Custody Auditor',
    spvDocumentHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    contractAddress: deployedContracts.tokens['asset-re-1'] || '0x07032d47A1b9f8460cBeE9dC17c1d3E438693929',
    description: 'Prime Grade-A commercial skyscraper in central Tokyo occupied by global financial institutions and technology firms. Rental revenue feeds directly into dividend payout streams.',
    features: [
      'Prime Financial District Property',
      'Long-Term Corporate Leases',
      'Quarterly Property Appraisal',
      'Liquidity Pool Support on BDEX'
    ]
  },
  {
    id: 'asset-tbill-1',
    name: 'U.S. Short-Term Treasury Reserve Vault',
    category: 'treasury',
    categoryName: 'Government Debt Vault',
    location: 'Delaware SPV, USA',
    totalValueUSD: 10000000,
    fractionPriceBOT: 0.05,
    fractionPriceUSDT: 0.01,
    totalFractions: 200000000,
    availableFractions: 72000000,
    apy: 5.2,
    image: '/assets/treasury_vault.png',
    riskScore: 'AAA',
    telemetryType: 'Yield Collateral',
    telemetryCurrentValue: '100',
    telemetryUnit: '% Collateral Backed',
    verifier: 'Bank Custody Attestation',
    spvDocumentHash: 'QmPZ9GcBqR7M3W4nK6v8yX1z2A3b4C5d6E7f8g9h0i1j2',
    contractAddress: deployedContracts.tokens['asset-tbill-1'] || '0x1e8bb093ade678ABAa49623D4c3a1a7F37716DEd',
    description: 'Institutional-grade vault backed 1:1 by short-dated U.S. Treasury Bills (0-3 month maturity) held in qualified bank custody. Provides predictable base yield on BOT Chain.',
    features: [
      '1:1 U.S. T-Bill Collateral Backing',
      'Daily Interest Accrual & Cash Out',
      'Permissioned ERC-3643 Standard',
      'Low Impermanent Loss Risk'
    ]
  }
];
