import React, { useState, useEffect } from 'react';
import { WalletState, RWAAsset, UserStakedPosition, ActiveTabType } from './types';
import { BOT_CHAIN_PARAMS, ACTIVE_NETWORK_KEY, SAMPLE_RWA_ASSETS } from './constants/botChain';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AssetMarketplace } from './components/AssetMarketplace';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AIPilotChat } from './components/AIPilotChat';
import { StakingDashboard } from './components/StakingDashboard';
import { ProofOfReserveScanner } from './components/ProofOfReserveScanner';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './context/ToastContext';
import { ethers } from 'ethers';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('home');
  const [selectedAsset, setSelectedAsset] = useState<RWAAsset | null>(null);
  const toast = useToast();

  const activeParams = BOT_CHAIN_PARAMS[ACTIVE_NETWORK_KEY];

  // Real EVM Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    botBalance: '0.00',
    usdtBalance: '0.00',
    wbotBalance: '0.00',
    isCorrectNetwork: false,
  });

  const [stakedPositions, setStakedPositions] = useState<UserStakedPosition[]>([]);

  // Switch network directly to target BOT Chain network (Testnet 968 or Mainnet 677)
  const switchToBOTChain = async (targetNetwork: 'testnet' | 'mainnet' = ACTIVE_NETWORK_KEY) => {
    const params = BOT_CHAIN_PARAMS[targetNetwork];
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: params.hexChainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: params.hexChainId,
                  chainName: params.chainName,
                  rpcUrls: [params.rpcUrl],
                  nativeCurrency: params.nativeCurrency,
                  blockExplorerUrls: [params.blockExplorerUrl],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding BOT Chain network:', addError);
          }
        }
      }
    }
  };

  // Real EVM Wallet Connection via window.ethereum & Ethers.js
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          const balanceWei = await provider.getBalance(userAddress);
          const botBal = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
          const isCorrect = chainId === activeParams.chainId;

          setWallet({
            isConnected: true,
            address: userAddress,
            chainId: chainId,
            botBalance: botBal,
            usdtBalance: '0.00',
            wbotBalance: '0.00',
            isCorrectNetwork: isCorrect
          });
          
          localStorage.setItem('veritas_wallet_connected', 'true');

          if (!isCorrect) {
            await switchToBOTChain(ACTIVE_NETWORK_KEY);
          }
        }
      } catch (err) {
        console.error('Real wallet connection error:', err);
      }
    } else {
      toast.warning('No EVM Wallet detected! Please install MetaMask, Bitget Wallet, or TokenPocket to interact in real time on BOT Chain.');
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      botBalance: '0.00',
      usdtBalance: '0.00',
      wbotBalance: '0.00',
      isCorrectNetwork: false,
    });
    localStorage.removeItem('veritas_wallet_connected');
    toast.info('Wallet disconnected.');
  };

  // Auto-reconnect if connected in previous session
  useEffect(() => {
    if (localStorage.getItem('veritas_wallet_connected') === 'true') {
      connectWallet();
    }
  }, []);

  // Listen to window.ethereum account / network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        connectWallet();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
          (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const handlePurchaseSuccess = (asset: RWAAsset, fractions: number, totalBOT: number) => {
    connectWallet(); // Refresh real on-chain balance
    const newPos: UserStakedPosition = {
      assetId: asset.id || asset.contractAddress,
      assetName: asset.name,
      fractionsOwned: fractions,
      stakedAmountBOT: totalBOT,
      unclaimedYieldBOT: 0,
      dailyYieldBOT: (totalBOT * (asset.apy / 100)) / 365,
      stakingDate: new Date().toLocaleDateString()
    };
    setStakedPositions((prev) => [...prev, newPos]);
    toast.success(`Successfully fractionalized ${fractions} shares in ${asset.name}!`);
  };

  const handleClaimAllYield = () => {
    setStakedPositions((prev) =>
      prev.map((pos) => ({
        ...pos,
        unclaimedYieldBOT: 0,
      }))
    );
    connectWallet(); // Refresh real on-chain balance
    toast.success('Yield dividend successfully claimed to your BOT Chain wallet!');
  };

  const handleAIAgentAction = (actionType: string, details: string) => {
    if (actionType === 'RECOMMEND_PORTFOLIO' || actionType === 'EXECUTE_REBALANCE') {
      setActiveTab('staking');
      toast.info('Navigated to Staking Dashboard for AI portfolio rebalance.');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAFAFC] text-[#111118] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        onSwitchNetwork={() => switchToBOTChain(ACTIVE_NETWORK_KEY)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Router */}
      <main className="flex-1 pt-16 sm:pt-18">
        {activeTab === 'home' && (
          <LandingPage
            assets={SAMPLE_RWA_ASSETS}
            onNavigateTab={setActiveTab}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />
        )}

        {activeTab === 'marketplace' && (
          <AssetMarketplace
            assets={SAMPLE_RWA_ASSETS}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            wallet={wallet}
          />
        )}

        {activeTab === 'staking' && (
          <StakingDashboard
            wallet={wallet}
            positions={stakedPositions}
            onClaimAllYield={handleClaimAllYield}
          />
        )}

        {activeTab === 'ai-pilot' && (
          <AIPilotChat onExecuteAction={handleAIAgentAction} />
        )}

        {activeTab === 'proofs' && (
          <ProofOfReserveScanner />
        )}

        {activeTab === 'admin' && (
          <AdminPanel wallet={wallet} />
        )}
      </main>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        wallet={wallet}
        onClose={() => setSelectedAsset(null)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
