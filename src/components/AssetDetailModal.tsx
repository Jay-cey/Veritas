import React, { useState } from 'react';
import { RWAAsset, WalletState } from '../types';
import { TelemetryChart } from './TelemetryChart';
import { getActiveNetworkParams } from '../constants/botChain';
import { ethers } from 'ethers';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, ExternalLink, Calculator, FileText, CheckCircle2, Zap, AlertCircle, ArrowRight } from 'lucide-react';

interface AssetDetailModalProps {
  asset: RWAAsset | null;
  wallet: WalletState;
  onClose: () => void;
  onPurchaseSuccess: (asset: RWAAsset, fractions: number, totalBOT: number) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  wallet,
  onClose,
  onPurchaseSuccess
}) => {
  if (!asset) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'calculator' | 'legal'>('overview');
  const [purchaseFractions, setPurchaseFractions] = useState<number>(10);
  const [paymentCurrency, setPaymentCurrency] = useState<'BOT' | 'USDT'>('BOT');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeParams = getActiveNetworkParams();
  const totalCostBOT = purchaseFractions * asset.fractionPriceBOT;
  const totalCostUSDT = purchaseFractions * asset.fractionPriceUSDT;
  const estimatedAnnualYieldBOT = (totalCostBOT * (asset.apy / 100)).toFixed(2);
  const estimatedMonthlyYieldBOT = ((totalCostBOT * (asset.apy / 100)) / 12).toFixed(2);

  // REAL Smart Contract Execution on BOT Chain via Ethers.js v6
  const handleMintFraction = async () => {
    setErrorMessage(null);
    setMintTxHash(null);

    if (!wallet.isConnected || !(window as any).ethereum) {
      setErrorMessage("Please connect your EVM wallet to execute on BOT Chain!");
      return;
    }

    setIsMinting(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      if (paymentCurrency === 'USDT') {
        // USDT purchase flow (requires approval)
        const usdtAbi = [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)"
        ];
        const vaultAbi = [
          "function purchaseFractionsWithUSDT(address _assetToken, uint256 _fractionsToBuy, uint256 _pricePerFractionUSDT) external"
        ];

        const usdtContract = new ethers.Contract(activeParams.usdtContract, usdtAbi, signer);
        const vaultContract = new ethers.Contract(activeParams.vaultContract, vaultAbi, signer);

        // Convert USDT float amounts to 18 decimal places (standard for BOT USDT)
        const pricePerFractionUSDTWei = ethers.parseUnits(asset.fractionPriceUSDT.toFixed(18), 18);
        const totalCostUSDTWei = pricePerFractionUSDTWei * BigInt(purchaseFractions);

        // 1. Check existing allowance
        const currentAllowance = await usdtContract.allowance(wallet.address, activeParams.vaultContract);

        if (currentAllowance < totalCostUSDTWei) {
          setErrorMessage("Approving USDT spent allowance in wallet...");
          const approveTx = await usdtContract.approve(activeParams.vaultContract, totalCostUSDTWei);
          await approveTx.wait(1);
          setErrorMessage("USDT spent approved successfully! Sending purchase transaction...");
        }

        // 2. Buy fractions
        const tx = await vaultContract.purchaseFractionsWithUSDT(
          asset.contractAddress,
          purchaseFractions,
          pricePerFractionUSDTWei
        );

        setMintTxHash(tx.hash);
        await tx.wait(1);

        setIsMinting(false);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        onPurchaseSuccess(asset, purchaseFractions, totalCostBOT);
      } else {
        // Native BOT purchase flow
        const vaultAbi = [
          "function purchaseFractionsWithBOT(address _assetToken, uint256 _fractionsToBuy, uint256 _pricePerFractionBOT) external payable"
        ];

        const vaultContract = new ethers.Contract(activeParams.vaultContract, vaultAbi, signer);

        // Convert BOT float amounts to wei safely
        const pricePerFractionWei = ethers.parseEther(asset.fractionPriceBOT.toFixed(18));
        const totalCostWei = pricePerFractionWei * BigInt(purchaseFractions);

        // Send transaction
        const tx = await vaultContract.purchaseFractionsWithBOT(
          asset.contractAddress,
          purchaseFractions,
          pricePerFractionWei,
          { value: totalCostWei }
        );

        setMintTxHash(tx.hash);
        await tx.wait(1);

        setIsMinting(false);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        onPurchaseSuccess(asset, purchaseFractions, totalCostBOT);
      }
    } catch (err: any) {
      console.error("Real Contract Execution Error:", err);
      setIsMinting(false);
      
      // Handle user rejection or RPC fallback display
      if (err.code === 4001 || err.message?.includes('user rejected')) {
        setErrorMessage("Transaction was cancelled in your wallet.");
      } else {
        let errMsg = err.reason || err.message || "Transaction broadcasted to BOT Chain network.";
        if (paymentCurrency === 'USDT') {
          // Prettify error to reflect selected currency
          errMsg = errMsg.replace(/BOT/g, 'USDT');
        }
        setErrorMessage(errMsg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-neutral-900 max-w-4xl w-full rounded-[32px] border border-neutral-200 overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
          <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20"></div>
          
          <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-300 mb-1">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/20 text-white font-medium">{asset.categoryName}</span>
                <span>•</span>
                <span className="text-white/80">{asset.location}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">{asset.name}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-black font-mono font-bold text-sm shadow-sm">
                {asset.apy}% APY
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/90 text-black font-mono font-bold text-sm shadow-sm">
                Rating {asset.riskScore}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-mono font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Overview & Specifications
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-3 text-xs font-mono font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'telemetry' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Live IoT Telemetry
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-3 text-xs font-mono font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'calculator' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Yield Calculator & ROI
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-4 py-3 text-xs font-mono font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'legal' ? 'border-black text-black font-bold' : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            Legal SPV & Contracts
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Tab Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-700 uppercase tracking-wider font-mono">Asset Summary</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1 font-sans">{asset.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-neutral-700 uppercase tracking-wider font-mono mb-2">Key Protocol Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {asset.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Contract Address</div>
                    <div className="text-xs font-mono text-neutral-900 truncate mt-1">{asset.contractAddress}</div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Verified Oracle</div>
                    <div className="text-xs font-mono text-emerald-700 truncate mt-1 font-bold">{asset.verifier}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 font-sans">
                  Real-time IoT sensors transmit cryptographic state proofs directly onto BOT Chain every 15 seconds.
                </p>
                <TelemetryChart
                  telemetryType={asset.telemetryType}
                  unit={asset.telemetryUnit}
                  currentValue={asset.telemetryCurrentValue}
                  verifier={asset.verifier}
                />
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-neutral-900">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span className="uppercase font-bold">Interactive Earnings Forecast</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                      <div className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Estimated Monthly Payout</div>
                      <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                        {estimatedMonthlyYieldBOT} BOT
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">~${(parseFloat(estimatedMonthlyYieldBOT) * 0.0425).toFixed(2)} USDT</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                      <div className="text-[10px] text-neutral-500 font-mono uppercase font-semibold">Estimated Annual Yield</div>
                      <div className="text-lg font-bold text-neutral-900 font-mono mt-1">
                        {estimatedAnnualYieldBOT} BOT
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">~${(parseFloat(estimatedAnnualYieldBOT) * 0.0425).toFixed(2)} USDT</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="text-neutral-500 font-semibold">DocuSign IPFS Legal Audit Hash:</div>
                  <div className="text-neutral-900 break-all bg-white p-2.5 rounded-xl border border-neutral-200 text-[11px]">
                    {asset.spvDocumentHash}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-neutral-900 font-bold">BOT Chain Explorer Contract</div>
                    <div className="text-neutral-500 text-[10px]">Verified bytecode on {activeParams.blockExplorerUrl}</div>
                  </div>
                  <a
                    href={`${activeParams.blockExplorerUrl}/address/${asset.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-black text-white flex items-center space-x-1 hover:bg-neutral-800 transition-colors font-bold text-xs"
                  >
                    <span>View on Scan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Real On-Chain Minting Sidebar */}
          <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">Mint Fractions</h3>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">Available: {asset.availableFractions.toLocaleString()}</span>
              </div>

              {/* Currency Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-200/80 border border-neutral-300">
                <button
                  onClick={() => setPaymentCurrency('BOT')}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    paymentCurrency === 'BOT' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Pay with BOT
                </button>
                <button
                  onClick={() => setPaymentCurrency('USDT')}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    paymentCurrency === 'USDT' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Pay with USDT
                </button>
              </div>

              {/* Input Shares */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-500 font-medium">Fractions to Purchase:</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={asset.availableFractions}
                    value={purchaseFractions}
                    onChange={(e) => setPurchaseFractions(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl text-sm font-mono text-neutral-900 font-bold bg-white border border-neutral-300 focus:outline-none focus:border-black"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">Shares</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Price / Fraction:</span>
                  <span className="text-neutral-900 font-bold">
                    {paymentCurrency === 'BOT' ? `${asset.fractionPriceBOT} BOT` : `$${asset.fractionPriceUSDT} USDT`}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500 pt-1 border-t border-neutral-100">
                  <span>Total Amount:</span>
                  <span className="text-neutral-900 font-extrabold text-sm">
                    {paymentCurrency === 'BOT' ? `${totalCostBOT.toLocaleString()} BOT` : `$${totalCostUSDT.toLocaleString()} USDT`}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px] flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {mintTxHash && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] space-y-1">
                  <div className="flex items-center space-x-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Transaction Confirmed!</span>
                  </div>
                  <a
                    href={`${activeParams.blockExplorerUrl}/tx/${mintTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-black underline block text-[10px] font-semibold"
                  >
                    View TX: {mintTxHash}
                  </a>
                </div>
              )}
            </div>

            {/* Mint Action Button */}
            <button
              onClick={handleMintFraction}
              disabled={isMinting}
              className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
              {isMinting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Executing on BOT Chain...</span>
                </>
              ) : (
                <>
                  <span>Mint Shares On-Chain</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
