import React, { useState, useEffect } from 'react';
import verify from "../assets/verify.png";
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import idl from '../idl.json';
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

export default function VerifyProduct() {
  const [tokenId, setTokenId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    if (urlTokenId) {
      setTokenId(urlTokenId);
      verifyToken(urlTokenId, 'link');
    }
  }, []);

  const verifyToken = async (id, source = 'manual') => {
    setResult(null);
    setError('');
    setLoading(true);

    try {
      if (!id) {
        setError("Invalid Token Address.");
        setLoading(false);
        return;
      }

      // Use a public devnet RPC endpoint. No wallet required for reading.
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const provider = new anchor.AnchorProvider(connection, null, { preflightCommitment: "confirmed" });
      const program = new anchor.Program(idl, provider);
      
      // 1. Backend data
      const res = await axios.get(`http://${window.location.hostname}:5000/api/product/${id}`);
      const product = res.data;

      if (!product) {
        throw new Error("Product metadata not found on local server.");
      }

      // 2. Fetch the Product PDA
      const [productInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), Buffer.from(id.toString())],
        program.programId
      );

      const productInfoData = await program.account.productInfo.fetch(productInfoPda);
      const blockchainMetadataHashHex = Buffer.from(productInfoData.metadataHash).toString("hex");
      const manufacturer = productInfoData.manufacturer.toBase58();
      const owner = productInfoData.owner.toBase58();

      const metadataString = JSON.stringify({
        name: product.name,
        serial: product.serial,
        model: product.model,
        type: product.type,
        color: product.color,
        date: product.date
      });

      const localHash = SHA256(metadataString).toString();
      // On Ethereum they used "0x" prepended
      const blockchainMetadataHashStr = "0x" + blockchainMetadataHashHex;
      const localHashStr = "0x" + localHash;
      
      const isVerified = localHashStr === blockchainMetadataHashStr;

      const resultPayload = { isVerified, owner, manufacturer, product };
      setResult(resultPayload);

      try {
        const normalizedSource = source === 'link' ? 'link' : 'manual';
        await axios.post(`http://${window.location.hostname}:5000/api/scan`, {
          tokenId: id,
          manufacturer,
          owner,
          isVerified,
          source: normalizedSource,
          timestamp: new Date().toISOString(),
        });
      } catch (logErr) {
        console.error("Failed to log scan", logErr);
      }

      if (isVerified) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed. " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (!tokenId.trim()) {
      setError("Please enter a valid Token ID.");
      return;
    }
    verifyToken(tokenId.trim(), 'manual');
  };

  return (
    <div className="w-full bg-black min-h-screen relative overflow-hidden">
      {/* Subtle dotted matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-pulse-soft { animation: pulse-soft 2s infinite ease-in-out; }
      `}</style>

      <section className="w-full py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            <div className="animate-fade-in relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-[#5282E1] text-white text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(82,130,225,0.4)]">
                Product Verification
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-space-grotesk">
                Authenticate Your Purchase.
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-outfit">
                Ensure the legitimacy of your product using TagIn's blockchain verification. Enter the details manually.
              </p>

              <div className="bg-[#09090b] p-6 md:p-8 rounded-3xl shadow-2xl border border-white/10 mb-10 backdrop-blur-xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">
                      Token ID (6 Digits)
                    </label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#5282E1] focus:border-transparent transition-all duration-300 font-inter text-white placeholder-gray-600"
                      placeholder="e.g. 123456"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-[#5282E1] hover:bg-[#3d68bc] text-white font-medium rounded-xl transition-colors duration-300 flex items-center justify-center font-inter disabled:bg-gray-600"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify Manually"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 rounded-r-lg animate-fade-in font-inter">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="relative animate-fade-in mx-auto md:mr-0 pl-0 md:pl-10 h-full w-full flex items-center z-10">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b] to-[#18181b] rounded-[3rem] transform rotate-3 scale-105 -z-10 transition-transform duration-500 hover:rotate-6 border border-white/5"></div>
               {result ? (
                 <div className="w-full h-full min-h-[500px] bg-[#09090b] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col items-center p-8 justify-center backdrop-blur-xl">
                   {result.isVerified ? (
                     <div className="text-center w-full">
                       <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       </div>
                       <h2 className="text-3xl font-bold text-white mb-2 font-space-grotesk">Verified Authentic</h2>
                       <p className="text-gray-400 mb-8 font-inter">This product's digital twin matches its physical counterpart.</p>
                       
                       <div className="space-y-4 text-left w-full max-w-sm mx-auto">
                         <div className="bg-white/5 p-4 rounded-xl flex items-start border border-white/10">
                           <div className="bg-[#18181b] p-2 border border-white/10 rounded-lg mr-4 mt-1">
                             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <div className="w-full">
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter mb-1">Product Details</p>
                             <div className="space-y-2">
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Name</span>
                                 <span className="font-semibold text-white">{result.product.name}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Serial No.</span>
                                 <span className="font-medium text-white">{result.product.serial}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Model</span>
                                 <span className="font-medium text-white">{result.product.model}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Type</span>
                                 <span className="font-medium text-white">{result.product.type}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Color</span>
                                 <span className="font-medium text-white">{result.product.color}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-sm text-gray-400">Mfg Date</span>
                                 <span className="font-medium text-white">{result.product.date}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                         <div className="bg-white/5 p-4 rounded-xl flex items-center overflow-hidden border border-white/10">
                           <div className="bg-[#18181b] p-2 border border-white/10 rounded-lg mr-4 flex-shrink-0">
                             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter">Manufacturer</p>
                             <p className="font-mono text-sm text-white break-all">{result.manufacturer}</p>
                           </div>
                         </div>
                         <div className="bg-white/5 p-4 rounded-xl flex items-center overflow-hidden border border-white/10">
                           <div className="bg-[#18181b] p-2 border border-white/10 rounded-lg mr-4 flex-shrink-0">
                             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           </div>
                           <div className="min-w-0">
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter">Current Owner</p>
                             <p className="font-mono text-sm text-white break-all">{result.owner}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center w-full">
                       <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </div>
                       <h2 className="text-3xl font-bold text-white mb-2 font-space-grotesk">Verification Failed</h2>
                       <p className="text-gray-400 mb-6 font-inter">The digital signature does not match or the product is counterfeit.</p>
                       <p className="text-sm text-red-400 font-medium bg-red-500/10 py-2 px-4 rounded-lg inline-block font-inter border border-red-500/20">Warning: Potential inauthentic item detected.</p>
                     </div>
                   )}
                 </div>
               ) : (
                  <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#09090b] rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl relative z-10">
                    <img src={verify} alt="Verify Product" className="max-w-[70%] h-auto opacity-80" />
                  </div>
               )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
