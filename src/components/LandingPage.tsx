import React from 'react';
import { Hero } from './Hero';
import { RWAAsset, ActiveTabType } from '../types';
import { AssetCard } from './AssetCard';
import { ArrowRight, ArrowUpRight, Layers, Lock, Bot, CheckCircle2, Activity, Zap, Sparkles } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

interface LandingPageProps {
  assets: RWAAsset[];
  onNavigateTab: (tab: ActiveTabType) => void;
  onSelectAsset: (asset: RWAAsset) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({
  assets,
  onNavigateTab,
  onSelectAsset
}) => {
  const featuredAssets = assets.slice(0, 3);

  const workflowSteps = [
    {
      step: '01',
      title: 'Physical Asset Legal Tokenization',
      description: 'Physical assets (DePIN GPUs, Solar Grids, Real Estate) are held in legally audited Special Purpose Vehicles (SPVs) and fractionalized into ERC-20 token shares.',
      icon: <Lock className="w-5 h-5 text-[#00E575]" />
    },
    {
      step: '02',
      title: 'Verified IoT Telemetry Stream',
      description: 'On-site IoT hardware sensors transmit continuous compute, energy, and occupancy telemetry data directly onto BOT Chain.',
      icon: <Activity className="w-5 h-5 text-[#FFE600]" />
    },
    {
      step: '03',
      title: 'Yield Optimization & Vault Rebalancing',
      description: 'The strategy co-pilot evaluates telemetry parameters and optimizes staking vault rates to maximize yield output.',
      icon: <Bot className="w-5 h-5 text-purple-400" />
    },
    {
      step: '04',
      title: 'Streamed Dividend Distributions',
      description: 'Stakers earn real-time yield streaming natively in BOT tokens, with instant on-chain claimability.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header Section */}
      <Hero
        onExploreMarketplace={() => onNavigateTab('marketplace')}
        onLaunchAIPilot={() => onNavigateTab('ai-pilot')}
      />

      {/* Protocol Workflow Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-300/80 text-neutral-800 text-xs font-mono font-medium shadow-sm">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Architecture Overview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            How Veritas RWA Operates
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-sans max-w-xl mx-auto leading-relaxed">
            Bridge physical revenue-generating infrastructure with BOT Chain smart contracts.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
              className="bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 p-7 rounded-[28px] space-y-5 relative group transition-all duration-300 shadow-sm hover:shadow-md select-none"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center border border-neutral-200 shadow-sm">
                  {item.icon}
                </div>
                <span className="text-2xl font-black font-mono text-neutral-300 group-hover:text-black transition-colors">
                  {item.step}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Featured RWA Assets Preview Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-700 uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>On-Chain Vault Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Featured RWA Assets
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigateTab('marketplace')}
            className="px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center space-x-2 self-start sm:self-auto shadow-md group"
          >
            <span>Open Dedicated Marketplace</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white" />
          </motion.button>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAssets.map((asset) => (
            <motion.div key={asset.id} variants={itemVariants}>
              <AssetCard asset={asset} onSelect={onSelectAsset} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Yield Co-Pilot Feature Highlight (Stark Ink Featured Band) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-[32px] p-8 sm:p-12 border border-neutral-800 bg-[#0B0B0E] text-white relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-mono shadow-sm">
                <Bot className="w-3.5 h-3.5" />
                <span>Strategy Co-Pilot</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Transparent Yield Strategy Co-Pilot
              </h2>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                YieldBot is powered directly by Google Gemini LLM, evaluating real-time RWA asset vault data, APY targets, and hardware telemetry parameters to provide deep natural language strategy analysis and interactive portfolio guidance.
              </p>

              <div className="space-y-3 text-xs font-mono text-neutral-300 pt-1">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10F38B] shrink-0" />
                  <span>Direct Google Gemini 1.5/2.0 Flash LLM Integration</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10F38B] shrink-0" />
                  <span>Smart Contract Rebalancing Parameter Support</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10F38B] shrink-0" />
                  <span>Client-Side Local Storage Privacy — Secure API Key Connection</span>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigateTab('ai-pilot')}
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-bold text-xs tracking-wider uppercase transition-colors shadow-xl flex items-center space-x-2 group"
                >
                  <span>Launch Yield Co-Pilot</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-black" />
                </motion.button>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-[24px] p-7 border border-white/10 space-y-4 font-mono text-xs bg-[#16161B] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center space-x-2 text-purple-300 font-bold">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Yield Strategy Terminal</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#10F38B]/15 border border-[#10F38B]/30 text-[#10F38B] text-[10px] font-bold">
                  Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <div className="font-bold text-white">Engine Mode: Google Gemini LLM</div>
                <div className="text-neutral-400 text-[11px]">Evaluating 4 RWA asset streams on BOT Chain...</div>
              </div>

              <div className="space-y-2.5 text-neutral-300 text-xs pt-1">
                <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.03]">
                  <span className="text-neutral-400">Weighted Average Target Yield:</span>
                  <span className="text-[#10F38B] font-bold">11.94% APY</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-white/[0.03]">
                  <span className="text-neutral-400">Oracle Telemetry Status:</span>
                  <span className="text-cyan-400 font-semibold">Verified Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

