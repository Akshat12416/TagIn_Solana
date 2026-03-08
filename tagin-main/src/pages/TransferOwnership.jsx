import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from '../idl.json';
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const PROGRAM_ID = new PublicKey(idl.address);
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export default function TransferOwnership() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction, wallet } = useWallet();
  const [tokenId, setTokenId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return;
    }

    if (!tokenId || !newOwner) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/product/${tokenId}`);
      const product = res.data;
      if (!product) {
        throw new Error("Product metadata not found on server.");
      }

      const provider = new AnchorProvider(connection, wallet.adapter, AnchorProvider.defaultOptions());
      const program = new Program(idl, provider);
      const recipientPubkey = new PublicKey(newOwner);

      // Derive the Product Info PDA dynamically using the numerical token ID
      const [productInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), Buffer.from(tokenId.toString())],
        PROGRAM_ID
      );

      toast.info("Approving transaction in wallet...");

      const tx = await program.methods
        .transferProduct()
          .accounts({
            owner: publicKey,
            productInfo: productInfoPda,
            newOwner: recipientPubkey
        })
        .rpc();

      await connection.confirmTransaction(tx, 'confirmed');

      await axios.post('http://127.0.0.1:5000/api/transfer', {
        tokenId,
        from: publicKey.toBase58(),
        to: newOwner,
        timestamp: new Date().toISOString()
      });

      toast.success("Ownership transferred successfully!");
      setTokenId('');
      setNewOwner('');
    } catch (err) {
      console.error(err);
      toast.error("Transfer failed: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black min-h-screen relative overflow-hidden">
      {/* Subtle dotted matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-slide-in-left { animation: slideInLeft 0.4s ease-out backwards; }
        .input-field { transition: all 0.3s ease; }
        .input-field:focus { outline: none; border-color: #5282E1; box-shadow: 0 0 0 3px rgba(82, 130, 225, 0.2); }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
      `}</style>
      <section className="w-full">
        <div className="w-full max-w-8xl mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          <div className="min-h-screen flex items-center justify-center py-12 md:py-20">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8 md:mb-12 animate-fade-in-up relative z-10">
                <h1 className="font-semibold text-white text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-4">
                  Transfer Ownership
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Securely transfer product ownership via blockchain transaction
                </p>
              </div>

              <div className="bg-[#09090b] rounded-2xl border border-white/10 p-6 md:p-8 lg:p-10 animate-fade-in-up backdrop-blur-xl relative z-10">
                <div className="space-y-6">
                  <div className="animate-slide-in-left stagger-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Token ID (6 Digits)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit Product ID"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      className="input-field w-full px-4 md:px-5 py-3 md:py-4 rounded-xl border border-white/10 bg-black/50 text-white placeholder-gray-500 text-sm md:text-base"
                    />
                  </div>

                  <div className="animate-slide-in-left stagger-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Owner Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter new owner's wallet address"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      className="input-field w-full px-4 md:px-5 py-3 md:py-4 rounded-xl border border-white/10 bg-black/50 text-white placeholder-gray-500 text-sm md:text-base"
                    />
                  </div>

                  <div className="pt-4 animate-slide-in-left stagger-3">
                    <button
                      onClick={handleTransfer}
                      disabled={loading || !tokenId || !newOwner}
                      className="w-full flex justify-center py-3 md:py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm md:text-base font-medium text-white bg-[#5282E1] hover:bg-[#3d68bc] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        "Transfer Ownership"
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="dark" />
    </div>
  );
}