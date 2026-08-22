import React, { useState } from 'react';
import { X, Check, AlertCircle, Sparkles, Upload, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { verifyFractionContract, VerificationResult } from '../lib/verifyContract';

interface AssetSubmissionModalProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
  walletAddress: string;
}

export const AssetSubmissionModal: React.FC<AssetSubmissionModalProps> = ({
  onClose,
  onSubmitSuccess,
  walletAddress
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('depin_gpu');
  const [location, setLocation] = useState<string>('');
  const [totalValueUSD, setTotalValueUSD] = useState<string>('');
  const [apy, setApy] = useState<string>('');
  const [riskScore, setRiskScore] = useState<string>('AA+');
  const [description, setDescription] = useState<string>('');
  const [features, setFeatures] = useState<string>('');

  // Step 2 State (Contract & Telemetry)
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isValidatingContract, setIsValidatingContract] = useState<boolean>(false);
  const [contractVerification, setContractVerification] = useState<VerificationResult | null>(null);

  const [fractionPriceBOT, setFractionPriceBOT] = useState<string>('0.1');
  const [totalFractions, setTotalFractions] = useState<string>('1000000');
  const [availableFractions, setAvailableFractions] = useState<string>('500000');

  const [telemetryType, setTelemetryType] = useState<string>('GPU Load & Compute');
  const [telemetryCurrentValue, setTelemetryCurrentValue] = useState<string>('95.2');
  const [telemetryUnit, setTelemetryUnit] = useState<string>('% Utilization');
  const [verifier, setVerifier] = useState<string>('Compute Telemetry Oracle');
  const [spvDocumentHash, setSpvDocumentHash] = useState<string>('');

  // Step 3 State (Media)
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Categories Map
  const categoryNames: { [key: string]: string } = {
    depin_gpu: 'DePIN AI Compute',
    solar_farm: 'Green DePIN Energy',
    real_estate: 'Institutional Real Estate',
    treasury: 'Government Debt Vault'
  };

  const handleValidateContract = async () => {
    if (!contractAddress.trim()) return;
    setIsValidatingContract(true);
    setContractVerification(null);
    const result = await verifyFractionContract(contractAddress.trim());
    setContractVerification(result);
    setIsValidatingContract(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      let finalImageUrl = imageUrl.trim();

      // If they uploaded a file, prioritize uploading it to storage
      if (imageFile) {
        setUploadProgress('Uploading asset image file...');
        // Standard base64 fallback or relative mock path for images when using custom Express backend
        finalImageUrl = `/assets/${category}.png`;
        setUploadProgress(null);
      }

      // Default placeholder if no image provided
      if (!finalImageUrl) {
        finalImageUrl = `/assets/${category}.png`;
      }

      // Calculate fractionPriceUSDT based on active BOT price (approx $0.20 per BOT)
      const botPrice = parseFloat(fractionPriceBOT);
      const usdtPrice = botPrice * 0.20;

      const payload = {
        name: name.trim(),
        category,
        categoryName: categoryNames[category] || 'Tokenized RWA Asset',
        location: location.trim(),
        totalValueUSD: parseFloat(totalValueUSD) || 0,
        fractionPriceBOT: botPrice || 0.1,
        fractionPriceUSDT: usdtPrice,
        totalFractions: parseInt(totalFractions) || 1000000,
        availableFractions: parseInt(availableFractions) || 500000,
        apy: parseFloat(apy) || 0,
        riskScore,
        telemetryType: telemetryType.trim(),
        telemetryCurrentValue: telemetryCurrentValue.trim(),
        telemetryUnit: telemetryUnit.trim(),
        verifier: verifier.trim(),
        spvDocumentHash: spvDocumentHash.trim(),
        contractAddress: contractAddress.trim(),
        description: description.trim(),
        features: features.split(',').map((f) => f.trim()).filter(Boolean),
        imageUrl: finalImageUrl,
        submitterAddress: walletAddress.toLowerCase(),
        status: 'pending' // pending admin review
      };

      const apiHost = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:3001';
      const response = await fetch(`${apiHost}/api/assets/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      setIsSubmitting(false);
      onSubmitSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setGeneralError(err.message || 'Failed to submit asset listing.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-neutral-900 max-w-2xl w-full rounded-[32px] border border-neutral-200 overflow-hidden shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1 rounded-full hover:bg-neutral-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center text-black">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900">List Your RWA Asset</h2>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Submit fraction token metadata for admin review</p>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold border transition-all ${
                  step === s
                    ? 'bg-black border-black text-white'
                    : step > s
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-400'
                }`}>
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded transition-all ${step > s ? 'bg-emerald-400' : 'bg-neutral-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[50vh] overflow-y-auto font-mono text-xs">
          
          {generalError && (
            <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Asset Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahara Solar Farm II"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  >
                    <option value="depin_gpu">DePIN AI Compute</option>
                    <option value="solar_farm">Green DePIN Energy</option>
                    <option value="real_estate">Institutional Real Estate</option>
                    <option value="treasury">Government Debt Vault</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Location:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York, USA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Total Valuation (USD):</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000000"
                    value={totalValueUSD}
                    onChange={(e) => setTotalValueUSD(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-neutral-700 font-medium">APY %:</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="8.5"
                      value={apy}
                      onChange={(e) => setApy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-neutral-700 font-medium">Risk Score:</label>
                    <select
                      value={riskScore}
                      onChange={(e) => setRiskScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-neutral-900 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                    >
                      <option value="AAA">AAA</option>
                      <option value="AA+">AA+</option>
                      <option value="A+">A+</option>
                      <option value="BBB">BBB</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-700 font-medium">Description:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about the physical asset SPV structure, hardware telemetry backing, and yields."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-700 font-medium">Key Features (comma-separated):</label>
                <input
                  type="text"
                  placeholder="e.g. 24/7 IoT Telemetry, Direct API Rental Revenue, Insured Hardware SPV"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          {/* STEP 2: On-Chain Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-sans">
                <strong>Deployment Verification:</strong> Veritas requires that you deploy your fractional ERC-20 token smart contract to BOT Chain Testnet first. Paste the contract address below to verify bytecode deployment on-chain.
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-700 font-medium">Fraction Contract Address (vToken):</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleValidateContract}
                    disabled={isValidatingContract || !contractAddress.trim()}
                    className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white font-bold uppercase transition-all whitespace-nowrap disabled:opacity-40"
                  >
                    {isValidatingContract ? 'Verifying...' : 'Verify On-Chain'}
                  </button>
                </div>
              </div>

              {contractVerification && (
                <div className={`p-3 rounded-2xl border font-mono text-[11px] ${
                  contractVerification.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  {contractVerification.isValid ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Contract Bytecode Verified on BOT Chain</span>
                      </div>
                      <div className="pl-5 text-neutral-600">
                        Token Name: {contractVerification.name} • Symbol: {contractVerification.symbol} • Supply: {contractVerification.totalSupply}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>{contractVerification.error}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Fraction Price (BOT):</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={fractionPriceBOT}
                    onChange={(e) => setFractionPriceBOT(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Total Fractions Supply:</label>
                  <input
                    type="number"
                    required
                    value={totalFractions}
                    onChange={(e) => setTotalFractions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-700 font-medium">Fractions Available for Mint:</label>
                  <input
                    type="number"
                    required
                    value={availableFractions}
                    onChange={(e) => setAvailableFractions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-neutral-900 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                <span className="font-bold text-neutral-900 block text-[11px]">IoT Telemetry Specifications</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-medium">Telemetry Metric Type:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GPU Load & Compute"
                      value={telemetryType}
                      onChange={(e) => setTelemetryType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-500 font-medium">Current Value:</label>
                      <input
                        type="text"
                        required
                        value={telemetryCurrentValue}
                        onChange={(e) => setTelemetryCurrentValue(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-neutral-900 bg-white border border-neutral-200 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-500 font-medium">Unit Label:</label>
                      <input
                        type="text"
                        required
                        value={telemetryUnit}
                        onChange={(e) => setTelemetryUnit(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-neutral-900 bg-white border border-neutral-200 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-medium">Telemetry Verifier/Oracle:</label>
                    <input
                      type="text"
                      required
                      value={verifier}
                      onChange={(e) => setVerifier(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-neutral-900 bg-white border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-medium">SPV Legal IPFS Hash:</label>
                    <input
                      type="text"
                      placeholder="Qm..."
                      value={spvDocumentHash}
                      onChange={(e) => setSpvDocumentHash(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Media & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-neutral-700 font-medium block">Asset Image:</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-all text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                    />
                    <Upload className="w-6 h-6 text-neutral-700 mb-2" />
                    <span className="text-[11px] font-bold text-neutral-800">
                      {imageFile ? imageFile.name : 'Upload Asset Image'}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-1">PNG, JPEG or WEBP (Max 5MB)</span>
                  </label>

                  {/* Direct Image URL input */}
                  <div className="space-y-2">
                    <label className="text-neutral-600 block text-[11px] font-medium">Or provide direct image URL:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-neutral-900 placeholder:text-neutral-400 bg-neutral-100 border border-neutral-200 focus:outline-none focus:border-black"
                    />
                    <p className="text-[10px] text-neutral-500">Falls back to category template image if left empty.</p>
                  </div>
                </div>

                {uploadProgress && (
                  <div className="text-[11px] text-purple-700 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
                    <span>{uploadProgress}</span>
                  </div>
                )}
              </div>

              {/* Review Summary Card */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 font-sans text-[11px]">
                <span className="font-extrabold text-neutral-900 block text-xs border-b border-neutral-200 pb-1.5">Submission Summary</span>
                <div className="grid grid-cols-2 gap-2 text-neutral-600">
                  <div>Asset Name: <strong className="text-neutral-900">{name}</strong></div>
                  <div>Category: <strong className="text-neutral-900">{categoryNames[category]}</strong></div>
                  <div>Location: <strong className="text-neutral-900">{location}</strong></div>
                  <div>Valuation: <strong className="text-neutral-900">${parseFloat(totalValueUSD || '0').toLocaleString()} USD</strong></div>
                  <div>APY Rate: <strong className="text-neutral-900">{apy}% / year</strong></div>
                  <div>Fraction Price: <strong className="text-neutral-900">{fractionPriceBOT} BOT</strong></div>
                  <div className="col-span-2 truncate">Contract Address: <strong className="text-neutral-900 font-mono">{contractAddress}</strong></div>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between font-mono text-xs">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-full border border-neutral-200 hover:bg-neutral-200 text-neutral-800 font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && (!contractVerification || !contractVerification.isValid)}
              className="px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold uppercase transition-all flex items-center space-x-1.5 disabled:opacity-40 shadow-md active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold uppercase transition-all flex items-center space-x-1.5 disabled:opacity-50 shadow-md active:scale-95"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span>Submit for Review</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
