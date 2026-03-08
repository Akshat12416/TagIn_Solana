import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

const TransferHistory = ({ userAddress }) => {
  const { tokenId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  useEffect(() => {
    // We check if wallet is connected instead of just userAddress
    if (!publicKey) {
      navigate(`/login?redirect=history/${tokenId}`);
    }
  }, [publicKey, navigate, tokenId]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/transfers/${tokenId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch transfer history", err);
    }
  };

  useEffect(() => {
    if (publicKey) fetchHistory();
  }, [tokenId, publicKey]);

  const handleTransfer = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return;
    }
    if (!newOwner) {
      toast.error("Please enter the recipient wallet address");
      return;
    }

    setLoading(true);
    try {
      const mintPubkey = new PublicKey(tokenId);
      const recipientPubkey = new PublicKey(newOwner);

      const sourceTokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
      const destinationTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

      const destAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
      const tx = new Transaction();

      if (!destAccountInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            destinationTokenAccount, // associatedToken
            recipientPubkey, // owner
            mintPubkey // mint
          )
        );
      }

      tx.add(
        createTransferInstruction(
          sourceTokenAccount,
          destinationTokenAccount,
          publicKey,
          1 // Amount (NFT is 1)
        )
      );

      toast.info("Approving transaction...");
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Update backend record
      await axios.post(`http://${window.location.hostname}:5000/api/transfer`, {
        tokenId,
        from: publicKey.toBase58(),
        to: newOwner,
        timestamp: new Date().toISOString(),
      });

      toast.success("✅ Ownership transferred successfully!");
      setNewOwner('');
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error("❌ Transfer failed: " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Subtle dotted matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-white mb-8 font-space-grotesk">
          Transfer History for Token ID: <span className="text-[#5282E1]">{tokenId}</span>
        </h1>

        <div className="bg-[#09090b] rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-6 font-space-grotesk">Transaction History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg font-inter">No transfer records found.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((entry, idx) => (
                <li 
                  key={idx} 
                  className="p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all bg-white/5"
                >
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-300 text-sm font-inter">From:</span>
                      <p className="font-mono text-white text-xs mt-1 break-all">
                        {entry.from}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-300 text-sm font-inter">To:</span>
                      <p className="font-mono text-white text-xs mt-1 break-all">
                        {entry.to}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10 font-inter">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[#09090b] rounded-3xl shadow-2xl p-6 md:p-8 border border-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-4 text-white font-space-grotesk">Transfer Ownership</h2>
          <p className="text-gray-400 mb-6 leading-relaxed font-inter">
            You are the current owner. Enter the new wallet address to transfer ownership:
          </p>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-5 py-4 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#5282E1] focus:border-transparent font-inter bg-black/50 text-white placeholder-gray-600"
              placeholder="Enter Recipient Wallet Address (Base58)"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
            />
            <button
              onClick={handleTransfer}
              disabled={loading || !newOwner.trim()}
              className="w-full bg-[#5282E1] hover:bg-[#3d68bc] text-white font-semibold py-4 px-6 rounded-xl transition disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center font-inter"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Transfer NFT"
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="dark" />
    </div>
  );
};

export default TransferHistory;