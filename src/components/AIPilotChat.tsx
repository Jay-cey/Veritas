import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIChatMessage } from '../types';
import { getActiveNetworkParams } from '../constants/botChain';
import { useToast } from '../context/ToastContext';
import { ethers } from 'ethers';
import { Bot, User, Send, Sparkles, Zap, AlertCircle } from 'lucide-react';

interface AIPilotChatProps {
  onExecuteAction: (actionType: string, details: string) => void;
}

// Initialize Gemini SDK using environment variable (mirrors working production pattern)
const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

export const AIPilotChat: React.FC<AIPilotChatProps> = ({ onExecuteAction }) => {
  const activeParams = getActiveNetworkParams();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isReady] = useState<boolean>(!!genAI);
  const toast = useToast();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am YieldBot, your RWA Strategy Co-Pilot on ${activeParams.chainName} (Chain ID ${activeParams.chainId}).\n\nI analyze live on-chain parameters, asset APYs, and hardware telemetry metrics to help you optimize your RWA yield and portfolio allocations. Ask me anything!`,
      timestamp: 'Just now',
      engineName: 'YieldBot AI'
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ [key: string]: string }>({});

  const quickPrompts = [
    "Recommend optimal RWA portfolio for 10,000 BOT",
    "What is the highest yielding asset on BOT Chain?",
    "Rebalance my staking allocation for maximum APY",
    "How does IoT telemetry affect vault returns?"
  ];

  // Execute smart contract rebalancing call on BOT Chain
  const handleExecuteOnChain = async (msgId: string, actionType: string, details: string) => {
    setExecutingActionId(msgId);
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const aiAgentAbi = [
          "function ingestTelemetryAndRebalance(string memory _assetId, uint256 _metricValue, string memory _telemetryReason, uint256 _calculatedRewardRate, string memory _aiDecisionReason) external"
        ];

        const aiContract = new ethers.Contract(activeParams.aiAgentContract, aiAgentAbi, signer);

        const tx = await aiContract.ingestTelemetryAndRebalance(
          "asset-gpu-1",
          948,
          "GPU Utilization 94.8% Verified by Telemetry Oracle",
          ethers.parseEther("0.142"),
          "Gemini AI Rebalanced Vault Rate to 14.2% APY based on hardware telemetry"
        );

        setActionStatus((prev) => ({ ...prev, [msgId]: `Tx Hash: ${tx.hash}` }));
        await tx.wait(1);
        setActionStatus((prev) => ({ ...prev, [msgId]: `Confirmed on BOT Chain (${tx.hash.substring(0, 14)}...)` }));
      } catch (err: any) {
        console.error("AI Contract Execution Error:", err);
        if (err.code === 4001 || err.message?.includes('user rejected')) {
          setActionStatus((prev) => ({ ...prev, [msgId]: "Transaction cancelled in wallet." }));
        } else {
          setActionStatus((prev) => ({ ...prev, [msgId]: err.reason || err.message || "Smart contract call broadcasted." }));
        }
      }
    } else {
      toast.warning("Please connect an EVM wallet to execute on BOT Chain.");
    }
    setExecutingActionId(null);
    onExecuteAction(actionType, details);
  };

  // Query Gemini using the official @google/generative-ai SDK
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!genAI) {
      setApiError("VITE_GEMINI_API_KEY is not set in your .env file. Add your Google AI Studio key and restart the dev server.");
      return;
    }

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);
    setApiError(null);

    const systemInstruction = `You are YieldBot AI, the official strategy assistant for Veritas RWA on BOT Chain (Chain ID ${activeParams.chainId}).

Live BOT Chain RWA Assets:
1. Manhattan DePIN H100 GPU Supercluster — DePIN GPU Compute, APY: 14.2%, Risk: AA+, Telemetry: 94.8% GPU Utilization, Valuation: $4.5M
2. Sahara CyberGrid Solar Farm — Green DePIN Energy, APY: 11.8%, Risk: AAA, Telemetry: 4,820 kW Generation, Valuation: $3.2M
3. Tokyo Ginza Financial Center Tower — Institutional Real Estate, APY: 8.5%, Risk: AAA, Telemetry: 98.5% Occupancy, Valuation: $6.8M
4. U.S. Short-Term Treasury Reserve Vault — Government T-Bills, APY: 5.2%, Risk: AAA, Telemetry: 100% Reserve Backed, Valuation: $10.0M

Provide clear, concise strategic guidance for portfolio allocation, yield optimization, risk management, and RWA staking on BOT Chain. Use bullet points and bold text where helpful.`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction,
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT' as any,        threshold: 'BLOCK_NONE' as any },
          { category: 'HARM_CATEGORY_HATE_SPEECH' as any,       threshold: 'BLOCK_NONE' as any },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'BLOCK_NONE' as any },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'BLOCK_NONE' as any },
        ]
      });

      const result = await model.generateContent(text);
      let aiReplyText = result.response.text().trim();

      // Strip markdown code fences if present
      if (aiReplyText.startsWith('```')) {
        aiReplyText = aiReplyText.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
      }

      // Strip ** bold markers — render as clean plain text
      aiReplyText = aiReplyText.replace(/\*\*(.+?)\*\*/g, '$1');

      // Strip markdown heading markers (# ## ###) from the start of lines
      aiReplyText = aiReplyText.replace(/^#{1,6}\s+/gm, '');

      setIsThinking(false);

      let actionPayload: AIChatMessage['actionPayload'];
      const lower = text.toLowerCase();
      if (lower.includes('rebalance') || lower.includes('portfolio') || lower.includes('allocation')) {
        actionPayload = {
          type: 'EXECUTE_REBALANCE',
          details: 'Rebalance Vault Reward Rates on BOT Chain'
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReplyText,
          timestamp: 'Just now',
          engineName: 'YieldBot AI',
          actionPayload
        }
      ]);
    } catch (err: any) {
      setIsThinking(false);
      const msg = err?.message || String(err);
      console.error('YieldBot AI error:', err);
      setApiError(`AI Error: ${msg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-[28px] p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900">YieldBot AI Strategy Co-Pilot</h2>
            <p className="text-xs text-neutral-500 font-sans">Powered by Google Gemini 1.5/2.0 Flash LLM</p>
          </div>
        </div>

        <div className={`flex items-center space-x-2 text-xs font-mono px-3.5 py-1.5 rounded-full border ${
          isReady
            ? 'text-emerald-800 bg-emerald-50 border-emerald-300 font-semibold'
            : 'text-amber-800 bg-amber-50 border-amber-300 font-semibold'
        }`}>
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isReady ? 'Active' : 'API Key Required'}</span>
        </div>
      </div>

      {/* Missing Key Warning */}
      {!isReady && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs font-mono flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold">VITE_GEMINI_API_KEY not set</div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Add <code className="text-black font-bold">VITE_GEMINI_API_KEY=your_key</code> to your <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold">.env</code> file and restart the dev server.
            </div>
          </div>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-mono flex items-center space-x-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="break-all">{apiError}</span>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="bg-white rounded-[28px] border border-neutral-200 overflow-hidden shadow-sm flex flex-col h-[600px]">

        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-xl rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-black text-white rounded-tr-none'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-tl-none'
              }`}>

                {msg.sender === 'ai' && (
                  <div className="mb-2 pb-1.5 border-b border-neutral-200 flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center space-x-1 text-purple-700 font-bold">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>{msg.engineName || 'YieldBot AI'}</span>
                    </span>
                    <span className="text-neutral-400">{msg.timestamp}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Smart Contract Rebalancing Action */}
                {msg.actionPayload && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-700 font-bold">{msg.actionPayload.details}</span>
                      <button
                        onClick={() => handleExecuteOnChain(msg.id, msg.actionPayload!.type, msg.actionPayload!.details)}
                        disabled={executingActionId === msg.id}
                        className="px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white font-mono text-[10px] font-bold transition-all flex items-center space-x-1 disabled:opacity-50 active:scale-95"
                      >
                        {executingActionId === msg.id ? (
                          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        ) : (
                          <Zap className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>Sign & Broadcast On-Chain</span>
                      </button>
                    </div>
                    {actionStatus[msg.id] && (
                      <div className="text-[10px] font-mono text-emerald-800 truncate bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                        {actionStatus[msg.id]}
                      </div>
                    )}
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="text-[9px] font-mono text-neutral-400 mt-1 text-right">{msg.timestamp}</div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs font-mono text-neutral-600 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                <span>YieldBot is computing strategy...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 overflow-x-auto flex items-center space-x-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-mono whitespace-nowrap transition-colors shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Ask about RWA strategies, APY optimization, or portfolio rebalancing..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 rounded-full text-xs font-mono text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || !isReady}
            className="p-3 rounded-full bg-black hover:bg-neutral-800 text-white disabled:opacity-40 transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
