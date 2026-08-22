import React from 'react';
import { Shield, Cpu, Layers, TrendingUp, ArrowRight, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onExploreMarketplace: () => void;
  onLaunchAIPilot: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMarketplace, onLaunchAIPilot }) => {
  return (
    <div className="relative overflow-hidden bg-white text-black pt-8 pb-16 md:pt-24 md:pb-24 border-b border-neutral-200 select-none">
      
      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Narrative, CTAs & Bottom Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-8"
          >

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-[-0.035em] text-black leading-[1.08]"
              >
                Real-World Asset <br />
                Fractionalization <br />
                <span className="text-neutral-900">on BOT Chain</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base text-neutral-600 max-w-lg font-normal leading-relaxed"
              >
                Fractionalize real physical assets—compute clusters, green energy grids, commercial real estate, and treasury reserves—backed by on-chain yield distribution and live hardware telemetry.
              </motion.p>
            </div>

            {/* Call to Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreMarketplace}
                className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-black text-white hover:bg-neutral-800 shadow-md transition-colors flex items-center space-x-2 group"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLaunchAIPilot}
                className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors flex items-center space-x-2"
              >
                <Cpu className="w-4 h-4 text-neutral-700" />
                <span>Launch AI Co-Pilot</span>
              </motion.button>
            </motion.div>

            {/* Bottom Metrics Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8 border-t border-neutral-200 grid grid-cols-3 gap-4 sm:gap-6"
            >
              
              {/* Metric 1 */}
              <div className="space-y-2.5 pr-2 sm:pr-4 border-r border-neutral-200">
                <svg className="w-7 h-7 text-neutral-800" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 10 C12 6, 20 6, 28 10" />
                  <path d="M4 16 C12 12, 20 12, 28 16" />
                  <path d="M4 22 C12 18, 20 18, 28 22" />
                  <path d="M28 10 C26 16, 26 18, 28 22" />
                </svg>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
                    $24.5M
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">
                    catalog valuation
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-2.5 pr-2 sm:pr-4 border-r border-neutral-200">
                <svg className="w-7 h-7 text-neutral-800" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="24" height="24" rx="2" />
                  <line x1="16" y1="4" x2="16" y2="28" />
                  <line x1="4" y1="16" x2="28" y2="16" />
                  <line x1="16" y1="4" x2="28" y2="16" />
                  <line x1="4" y1="16" x2="16" y2="28" />
                </svg>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
                    4
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">
                    active vault classes
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-2.5">
                <svg className="w-7 h-7 text-neutral-800" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6,6 26,6 16,16 26,26 6,26 16,16" />
                  <line x1="16" y1="6" x2="16" y2="26" />
                </svg>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
                    10.0%
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">
                    average asset APY
                  </div>
                </div>
              </div>

            </motion.div>

          </motion.div>

          {/* Right Column: 4-Card Asymmetrical Staggered Cluster */}
          <div className="lg:col-span-6">
            <div className="w-full max-w-[560px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              
              {/* Left Stack (Offset downwards) */}
              <div className="space-y-6 sm:translate-y-6 lg:translate-y-10">
                
                {/* Card 1: Black Card (Tall) */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="relative group cursor-pointer"
                  onClick={onExploreMarketplace}
                >
                  {/* Offset wireframe outline */}
                  <div className="absolute -bottom-2.5 -left-2.5 w-full h-full rounded-[30px] border-2 border-neutral-300 pointer-events-none group-hover:-bottom-3.5 group-hover:-left-3.5 transition-all duration-300"></div>

                  <div className="relative bg-[#0B0B0E] text-white p-7 sm:p-8 rounded-[30px] shadow-2xl flex flex-col justify-between space-y-7 min-h-[360px]">
                    {/* Top wireframe circles + 01 badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-white/40"></div>
                        <div className="w-6 h-6 rounded-full border border-white/40"></div>
                        <div className="w-6 h-6 rounded-full border border-white/40"></div>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-neutral-800 border border-white/20 text-white text-xs font-mono font-bold flex items-center justify-center">
                        01
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2.5">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-mono uppercase tracking-wider">
                        vaults
                      </span>
                      <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-snug">
                        Fractional Vaults
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Institutional SPV structure with streaming block distributions.
                      </p>
                    </div>

                    {/* Mint Green Pill Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExploreMarketplace();
                      }}
                      className="w-full py-3.5 rounded-full bg-[#10F38B] hover:bg-[#00E575] text-black font-black text-xs tracking-wide transition-all shadow-lg shadow-[#10F38B]/20 active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <span>Explore now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>

                {/* Card 4: Lemon Yellow Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  onClick={onExploreMarketplace}
                  className="relative group cursor-pointer"
                >
                  {/* Solid black block shadow */}
                  <div className="absolute -bottom-2.5 -left-2.5 w-full h-full bg-black rounded-[30px] transition-transform duration-300 group-hover:-bottom-3.5 group-hover:-left-3.5"></div>

                  <div className="relative bg-[#FFDE43] text-black p-7 sm:p-8 rounded-[30px] flex flex-col justify-between space-y-6 min-h-[250px] border border-black/10">
                    {/* Top squircle icon */}
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                      <Shield className="w-4 h-4" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-black/75 tracking-tight block uppercase">
                        cancel anytime
                      </span>
                      <h3 className="text-2xl font-black text-black tracking-tight leading-tight">
                        tokenized assets on-chain
                      </h3>
                      <span className="text-xs text-black/75 font-semibold block pt-1">
                        legal ownership
                      </span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Right Stack (Offset upwards) */}
              <div className="space-y-6 sm:-translate-y-8 lg:-translate-y-12">
                
                {/* Card 2: Mint Green Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  onClick={onExploreMarketplace}
                  className="relative group cursor-pointer"
                >
                  {/* Solid black block shadow */}
                  <div className="absolute -bottom-2.5 -right-2.5 w-full h-full bg-black rounded-[30px] transition-transform duration-300 group-hover:-bottom-3.5 group-hover:-right-3.5"></div>

                  <div className="relative bg-[#10F38B] text-black p-7 sm:p-8 rounded-[30px] flex flex-col justify-between space-y-6 min-h-[230px] border border-black/10">
                    {/* Top squircle icon */}
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-black/75 tracking-tight block uppercase">
                        flexible contracts
                      </span>
                      <h3 className="text-2xl font-black text-black tracking-tight leading-tight">
                        earn yield in 24 hours
                      </h3>
                      <span className="text-xs text-black/75 font-semibold block pt-1">
                        oracle-verified
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: Silver/Gray Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="relative group cursor-pointer"
                  onClick={onLaunchAIPilot}
                >
                  {/* Offset wireframe outline */}
                  <div className="absolute -bottom-2.5 -right-2.5 w-full h-full rounded-[30px] border-2 border-neutral-300 pointer-events-none group-hover:-bottom-3.5 group-hover:-right-3.5 transition-all duration-300"></div>

                  <div className="relative bg-[#ECECEE] text-black p-7 sm:p-8 rounded-[30px] shadow-md flex flex-col justify-between space-y-7 min-h-[350px] border border-neutral-300">
                    {/* Top code icons + 02 badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono text-neutral-700 font-bold">
                        <span>{`{/}`}</span>
                        <span>{`</>`}</span>
                        <span>{`>_`}</span>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        02
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2.5">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-black/10 text-black text-[11px] font-mono uppercase tracking-wider">
                        co-pilot
                      </span>
                      <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-black leading-snug">
                        AI Yield Pilot
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Autonomous telemetry rebalancing & portfolio risk scanner.
                      </p>
                    </div>

                    {/* Black Pill Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchAIPilot();
                      }}
                      className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-black text-xs tracking-wide transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <span>Launch Co-Pilot</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
