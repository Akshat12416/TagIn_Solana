import React, { useState } from 'react';
import SHA256 from 'crypto-js/sha256';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import idl from '../idl.json';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Buffer } from "buffer";

// Ensure Buffer is available globally for browser compatibility
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const PROGRAM_ID = new PublicKey(idl.address);

export default function Registerproduct() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productName: '',
    serial: '',
    model: '',
    type: '',
    color: '',
    date: ''
  });

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const autofillDemoData = () => {
    setForm({
      productName: 'Casio Watch',
      serial: '75786',
      model: 'ab563',
      type: 'Watch',
      color: 'Black',
      date: '2026-03-08'
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    try {
      const { productName, serial, model, type, color, date } = form;
      const metadata = JSON.stringify({ name: productName, serial, model, type, color, date });
      const metadataHashStr = SHA256(metadata).toString();
      // convert 64 char hex string to 32 byte array
      const metadataHashBytes = Array.from(Buffer.from(metadataHashStr, 'hex'));

      const provider = new AnchorProvider(connection, wallet.adapter, AnchorProvider.defaultOptions());
      const program = new Program(idl, provider);

      // Fetch Next Token ID from Python Backend
      const idResponse = await axios.get('http://127.0.0.1:5000/api/next-id');
      const tokenIdString = idResponse.data.nextId;

      // Get Product Info PDA using the Token ID String
      const [productInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("product"), Buffer.from(tokenIdString)],
        PROGRAM_ID
      );

      // Get Whitelist PDA
      const [whitelistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("whitelist"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      toast.info("Approving transaction in wallet...");

      const tx = await program.methods
        .registerProduct(tokenIdString, metadataHashBytes)
        .accounts({
          manufacturer: publicKey,
          whitelistEntry: whitelistPda,
          productInfo: productInfoPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Tx signature:", tx);
      toast.success(`Product mapped on Solana! Confirming...`);

      await connection.confirmTransaction(tx, "confirmed");

      // Save to off-chain DB
      await axios.post('http://127.0.0.1:5000/api/register', {
        name: productName,
        serial,
        model,
        type,
        color,
        date,
        tokenId: tokenIdString,
        metadataHash: metadataHashStr,
        manufacturer: publicKey.toBase58(),
        owner: publicKey.toBase58(),
      });

      toast.success(`Product saved! Token ID for NFC is: ${tokenIdString}`, { autoClose: 6000 });
      setForm({
        productName: '',
        serial: '',
        model: '',
        type: '',
        color: '',
        date: ''
      });
    } catch (err) {
      console.error(err);
      toast.error("Error: " + (err.message || err.toString()));
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
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.4s ease-out backwards;
        }

        .input-field {
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: #5282E1;
          box-shadow: 0 0 0 3px rgba(82, 130, 225, 0.2);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.15s; }
        .stagger-3 { animation-delay: 0.2s; }
        .stagger-4 { animation-delay: 0.25s; }
        .stagger-5 { animation-delay: 0.3s; }
        .stagger-6 { animation-delay: 0.35s; }
        .stagger-7 { animation-delay: 0.4s; }
      `}</style>

      <section className="w-full">
        <div className="w-full max-w-8xl mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          <div className="min-h-screen flex items-center justify-center py-12 md:py-20">

            <div className="w-full max-w-2xl">
              {/* Header */}
              <div className="text-center mb-8 md:mb-12 animate-fade-in-up relative z-10">
                <h1 className="font-semibold text-white text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-4">
                  Register Product
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                  Register your product on the blockchain with tamper-proof verification
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-[#09090b] rounded-2xl border border-white/10 p-6 md:p-8 lg:p-10 animate-fade-in-up backdrop-blur-xl relative z-10">
                <form onSubmit={handleRegister} className="space-y-6">

                  {/* Autofill Button */}
                  <div className="flex justify-end animate-slide-in-left stagger-1">
                    <button
                      type="button"
                      onClick={autofillDemoData}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      Autofill Demo Data
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="animate-slide-in-left stagger-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Name
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500"
                        placeholder="Enter product name"
                        name="productName"
                        value={form.productName}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="animate-slide-in-left stagger-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Serial Number
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500"
                        placeholder="Enter serial number"
                        name="serial"
                        value={form.serial}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="animate-slide-in-left stagger-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Model
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500"
                        placeholder="Enter model number"
                        name="model"
                        value={form.model}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="animate-slide-in-left stagger-5">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Type
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500"
                        placeholder="Enter product type"
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="animate-slide-in-left stagger-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Color
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500"
                        placeholder="Enter product color"
                        name="color"
                        value={form.color}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="animate-slide-in-left stagger-7">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacture Date
                      </label>
                      <input
                        className="input-field w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white [color-scheme:dark]"
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-4 bg-[#5282E1] hover:bg-[#3d68bc] text-white text-base font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </span>
                      ) : (
                        "Register Product"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Info Section */}
              <div className="mt-8 text-center animate-fade-in-up relative z-10">
                <p className="text-sm text-gray-500">
                  Product will be registered on the blockchain with a unique 6-digit numerical token ID for NFC tagging
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}