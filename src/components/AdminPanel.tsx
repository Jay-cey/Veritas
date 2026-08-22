import React, { useState, useEffect } from 'react';
import { RWAAsset, WalletState } from '../types';
import { verifyFractionContract, VerificationResult } from '../lib/verifyContract';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, Check, X, RefreshCw, AlertCircle, Building2, MapPin, DollarSign, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  wallet: WalletState;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ wallet }) => {
  const adminAddress = '0xA4D0349DdeffEe42Afb019105cB55912F7b8e848'.toLowerCase();
  const currentAddress = (wallet.address || '').toLowerCase();
  const isAdmin = currentAddress === adminAddress;
  const toast = useToast();

  const [pendingAssets, setPendingAssets] = useState<RWAAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<{ [addr: string]: VerificationResult }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const apiHost = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:3001';
      const response = await fetch(`${apiHost}/api/assets/pending`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data) {
        const formatted = data.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          category: item.category,
          categoryName: item.categoryName,
          location: item.location,
          totalValueUSD: Number(item.totalValueUSD),
          fractionPriceBOT: Number(item.fractionPriceBOT),
          fractionPriceUSDT: Number(item.fractionPriceUSDT),
          totalFractions: Number(item.totalFractions),
          availableFractions: Number(item.availableFractions),
          apy: Number(item.apy),
          image: item.imageUrl,
          riskScore: item.riskScore,
          telemetryType: item.telemetryType,
          telemetryCurrentValue: item.telemetryCurrentValue,
          telemetryUnit: item.telemetryUnit,
          verifier: item.verifier,
          spvDocumentHash: item.spvDocumentHash,
          contractAddress: item.contractAddress,
          description: item.description,
          features: item.features || [],
          status: item.status,
          submitterAddress: item.submitterAddress
        }));
        setPendingAssets(formatted);

        // Verify all pending contracts on-chain in background
        for (const asset of formatted) {
          verifyFractionContract(asset.contractAddress).then((result) => {
            setVerifications((prev) => ({ ...prev, [asset.contractAddress]: result }));
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching pending assets:', err);
      setError(err.message || 'Failed to fetch pending assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [wallet.address]);

  const handleDecision = async (id: string, contractAddr: string, decision: 'live' | 'rejected') => {
    setProcessingId(id);
    try {
      const apiHost = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:3001';
      const endpoint = decision === 'live' ? `/api/assets/approve/${id}` : `/api/assets/reject/${id}`;
      
      const response = await fetch(`${apiHost}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setPendingAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Asset submission successfully ${decision === 'live' ? 'approved & listed live' : 'rejected'}.`);
    } catch (err: any) {
      console.error('Error processing asset decision:', err);
      toast.error(`Error processing decision: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Lock Screen for Non-Admin Wallets
  if (!isAdmin) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16 max-w-2xl mx-auto px-4 text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-neutral-900">403 Access Denied</h2>
          <p className="text-xs text-neutral-600 font-mono">
            This panel is protected and restricted to the admin address:
          </p>
          <code className="block bg-neutral-100 px-3 py-2 rounded-xl text-neutral-900 text-xs font-mono select-all max-w-md mx-auto border border-neutral-200 break-all font-bold">
            0xA4D0349DdeffEe42Afb019105cB55912F7b8e848
          </code>
        </div>
        <div className="p-4 rounded-2xl border border-neutral-200 bg-white text-xs text-neutral-600 font-sans max-w-md mx-auto leading-relaxed shadow-sm">
          {wallet.isConnected ? (
            <span>Connected wallet: <code className="text-black font-bold break-all">{wallet.address}</code> is unauthorized. Connect the admin wallet to view pending listings.</span>
          ) : (
            <span>Please connect your EVM wallet to verify administration status.</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6"
      >
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-700 uppercase tracking-widest mb-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Review Panel</h1>
          <p className="text-xs text-neutral-600 font-sans mt-1">
            Audit submitted RWA fractional tokens and verify their deployment parameters on BOT Chain.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchPending}
          disabled={isLoading}
          className="px-4 py-2 rounded-full border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-xs font-mono flex items-center space-x-1.5 transition-colors text-neutral-800 disabled:opacity-40 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </motion.button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-mono flex items-center space-x-2 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Pending Items List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 rounded-[28px] animate-pulse bg-neutral-200/60 border border-neutral-200" />
          ))}
        </div>
      ) : pendingAssets.length > 0 ? (
        <motion.div layout className="space-y-6">
          <AnimatePresence>
            {pendingAssets.map((asset) => {
              const verification = verifications[asset.contractAddress];

              return (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[28px] border border-neutral-200 overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-6"
                >
                  {/* Left: Thumbnail & Base info */}
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center relative">
                    {asset.image ? (
                      <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-12 h-12 text-neutral-400" />
                    )}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-black text-white shadow-sm">
                      {asset.categoryName}
                    </span>
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <span>{asset.name}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono uppercase font-bold">
                          Pending Approval
                        </span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 mt-1 font-mono">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{asset.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Valuation: ${(asset.totalValueUSD).toLocaleString()}</span>
                        </span>
                        <span className="text-emerald-700 font-bold">APY: {asset.apy}%</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 font-mono text-[11px] space-y-2">
                      <div>
                        Contract: <code className="text-neutral-900 font-bold break-all">{asset.contractAddress}</code>
                      </div>
                      {/* Live On-Chain verification badge */}
                      {verification ? (
                        <div className={`flex items-center space-x-1.5 font-sans ${
                          verification.isValid ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {verification.isValid ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>On-Chain Verified: {verification.name} ({verification.symbol}) • Supply: {Number(verification.totalSupply).toLocaleString()} fractions</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span>On-Chain Check Failed: {verification.error}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-neutral-500 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-ping"></span>
                          <span>Verifying contract deployment state...</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 font-sans leading-relaxed line-clamp-2">
                      {asset.description}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDecision(asset.id, asset.contractAddress, 'live')}
                      disabled={processingId !== null}
                      className="flex-1 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold uppercase transition-colors flex items-center justify-center space-x-1.5 text-xs shadow-md"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Approve</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDecision(asset.id, asset.contractAddress, 'rejected')}
                      disabled={processingId !== null}
                      className="flex-1 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold uppercase transition-colors flex items-center justify-center space-x-1.5 text-xs"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </motion.button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-16 rounded-[28px] text-center max-w-md mx-auto space-y-3 border border-neutral-200 shadow-sm"
        >
          <Layers className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900">No Pending Submissions</h3>
          <p className="text-xs text-neutral-500 font-sans">All submitted RWA asset proposals have been successfully audited and processed.</p>
        </motion.div>
      )}

    </div>
  );
};
