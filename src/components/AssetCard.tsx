import React from 'react';
import { RWAAsset } from '../types';
import { ShieldCheck, Cpu, Zap, Building2, Landmark, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface AssetCardProps {
  asset: RWAAsset;
  onSelect: (asset: RWAAsset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onSelect }) => {
  const getCategoryIcon = () => {
    switch (asset.category) {
      case 'depin_gpu':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'solar_farm':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'real_estate':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'treasury':
        return <Landmark className="w-4 h-4 text-blue-600" />;
      default:
        return <Cpu className="w-4 h-4 text-emerald-600" />;
    }
  };

  const fundedPercentage = Math.round(((asset.totalFractions - asset.availableFractions) / asset.totalFractions) * 100);

  return (
    <motion.div 
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
      onClick={() => onSelect(asset)}
      className="bg-white hover:bg-neutral-50/50 border border-neutral-200 hover:border-neutral-400 rounded-[28px] overflow-hidden flex flex-col justify-between transition-colors duration-200 shadow-sm hover:shadow-xl cursor-pointer group select-none h-full"
    >
      <div>
        {/* Card Header Image */}
        <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
          <img
            src={asset.image}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
          
          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-sm">
              {getCategoryIcon()}
              <span>{asset.categoryName}</span>
            </div>
            
            <div className="px-3 py-1.5 rounded-full bg-emerald-500 backdrop-blur-md text-xs font-mono font-bold text-black flex items-center space-x-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{asset.riskScore} Rating</span>
            </div>
          </div>

          {/* Bottom Floating Telemetry Indicator */}
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-mono text-neutral-800 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-md">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-neutral-500 font-medium">{asset.telemetryType}:</span>
            </div>
            <span className="text-black font-bold">{asset.telemetryCurrentValue} {asset.telemetryUnit}</span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">{asset.location}</div>
            <h3 className="text-lg font-extrabold text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-0.5">
              {asset.name}
            </h3>
          </div>

          {/* Financial Highlights */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold">Total Valuation</div>
              <div className="text-base font-extrabold text-neutral-900 font-mono mt-0.5">
                ${(asset.totalValueUSD / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold">Target APY</div>
              <div className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">
                {asset.apy}% / yr
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-500">Tokenized Supply Funded</span>
              <span className="text-black font-bold">{fundedPercentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${fundedPercentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-black rounded-full"
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-neutral-500 pt-0.5">
              <span>{asset.availableFractions.toLocaleString()} shares</span>
              <span className="text-neutral-800 font-semibold">{asset.fractionPriceBOT} BOT (${asset.fractionPriceUSDT})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 pb-6 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(asset);
          }}
          className="w-full py-3.5 px-5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md group/btn"
        >
          <span>Inspect & Mint Share</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};



