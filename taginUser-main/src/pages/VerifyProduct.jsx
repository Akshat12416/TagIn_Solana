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
      
      const mintPubkey = new PublicKey(id);

      // 1. Fetch the Product PDA
      const [productInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), mintPubkey.toBuffer()],
        program.programId
      );

      const productInfoData = await program.account.productInfo.fetch(productInfoPda);
      const blockchainMetadataHashHex = Buffer.from(productInfoData.metadataHash).toString("hex");
      const manufacturer = productInfoData.manufacturer.toBase58();

      // 2. Fetch the owner of the NFT (largest token account holder)
      const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);
      if (!largestAccounts.value || largestAccounts.value.length === 0) {
        throw new Error("No token accounts found for this NFT.");
      }
      const largestAccountPubkey = largestAccounts.value[0].address;
      const parsedTokenAccount = await connection.getParsedAccountInfo(largestAccountPubkey);
      const owner = parsedTokenAccount.value.data.parsed.info.owner;

      // 3. Backend data
      const res = await axios.get(`http://10.140.107.26:5000/api/product/${id}`);
      const product = res.data;

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
        const normalizedSource = source === 'nfc' || source === 'link' ? 'nfc' : 'manual';
        await axios.post("http://10.140.107.26:5000/api/scan", {
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

  const handleNFCScan = async () => {
    setError('');
    try {
      if (!('NDEFReader' in window)) {
        setError("NFC not supported on this device/browser.");
        return;
      }
      const ndef = new window.NDEFReader();
      await ndef.scan();
      ndef.onreading = (event) => {
        for (const record of event.message.records) {
          if (record.recordType === "text") {
            const text = new TextDecoder().decode(record.data);
            // Since Token ID is a Solana address, we extract non-whitespace strings (Base58 match)
            const idMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
            const id = idMatch ? idMatch[0] : null;
            if (id) {
              setTokenId(id);
              verifyToken(id, 'nfc');
            } else {
              setError("No valid Solana address found in NFC data.");
            }
          }
        }
      };
    } catch (err) {
      console.error(err);
      setError("NFC Scan failed: " + err.message);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-pulse-soft { animation: pulse-soft 2s infinite ease-in-out; }
        .nfc-waves::before, .nfc-waves::after { content: ''; position: absolute; border: 2px solid currentColor; border-radius: 50%; opacity: 0; transform: translate(-50%, -50%); top: 50%; left: 50%; animation: ripple 2s cubic-bezier(0.19, 1, 0.22, 1) infinite; }
        .nfc-waves::after { animation-delay: 1s; }
        @keyframes ripple { 0% { width: 0; height: 0; opacity: 0.5; } 100% { width: 100px; height: 100px; opacity: 0; } }
      `}</style>

      <section className="w-full py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            <div className="animate-fade-in">
              <span className="inline-block py-1 px-3 rounded-full bg-black text-white text-xs font-semibold tracking-wider uppercase mb-6">
                Product Verification
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 font-space-grotesk">
                Authenticate Your Purchase.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-outfit">
                Ensure the legitimacy of your product using TagIn's blockchain verification. Scan the NFC tag or enter the details manually.
              </p>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      Solana Mint Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 font-inter text-gray-900 placeholder-gray-400"
                      placeholder="e.g. 7myM..."
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors duration-300 flex items-center justify-center font-inter disabled:bg-gray-400"
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

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-inter">or via NFC</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <button
                    onClick={handleNFCScan}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-white border-2 border-black hover:bg-gray-50 text-black font-medium rounded-xl transition-colors duration-300 flex items-center justify-center font-inter relative overflow-hidden group disabled:border-gray-300 disabled:text-gray-400"
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-6 h-6 mr-3 group-hover:animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Scan NFC Tag
                    </span>
                    <div className="absolute inset-0 z-0 text-black opacity-20 nfc-waves group-hover:opacity-40 transition-opacity"></div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-fade-in font-inter">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="relative animate-fade-in mx-auto md:mr-0 pl-0 md:pl-10 h-full w-full flex items-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-[3rem] transform rotate-3 scale-105 -z-10 transition-transform duration-500 hover:rotate-6"></div>
               {result ? (
                 <div className="w-full h-full min-h-[500px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col items-center p-8 justify-center">
                   {result.isVerified ? (
                     <div className="text-center w-full">
                       <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       </div>
                       <h2 className="text-3xl font-bold text-gray-900 mb-2 font-space-grotesk">Verified Authentic</h2>
                       <p className="text-gray-500 mb-8 font-inter">This product's digital twin matches its physical counterpart.</p>
                       
                       <div className="space-y-4 text-left w-full max-w-sm mx-auto">
                         <div className="bg-gray-50 p-4 rounded-xl flex items-center">
                           <div className="bg-white p-2 border border-gray-200 rounded-lg mr-4">
                             <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter">Product Name</p>
                             <p className="font-semibold text-gray-900 font-inter">{result.product.name}</p>
                           </div>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl flex items-center">
                           <div className="bg-white p-2 border border-gray-200 rounded-lg mr-4">
                             <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter">Manufacturer</p>
                             <p className="font-mono text-sm text-gray-900 truncate w-48" title={result.manufacturer}>{result.manufacturer.substring(0,6)}...{result.manufacturer.substring(result.manufacturer.length-4)}</p>
                           </div>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-xl flex items-center">
                           <div className="bg-white p-2 border border-gray-200 rounded-lg mr-4">
                             <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           </div>
                           <div>
                             <p className="text-xs text-gray-500 font-medium uppercase font-inter">Current Owner</p>
                             <p className="font-mono text-sm text-gray-900 truncate w-48" title={result.owner}>{result.owner.substring(0,6)}...{result.owner.substring(result.owner.length-4)}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center w-full">
                       <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </div>
                       <h2 className="text-3xl font-bold text-gray-900 mb-2 font-space-grotesk">Verification Failed</h2>
                       <p className="text-gray-600 mb-6 font-inter">The digital signature does not match or the product is counterfeit.</p>
                       <p className="text-sm text-red-600 font-medium bg-red-50 py-2 px-4 rounded-lg inline-block font-inter">Warning: Potential inauthentic item detected.</p>
                     </div>
                   )}
                 </div>
               ) : (
                  <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden">
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
