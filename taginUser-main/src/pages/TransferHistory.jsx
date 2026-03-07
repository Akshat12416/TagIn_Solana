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
      const res = await axios.get(`http://127.0.0.1:5000/api/transfers/${tokenId}`);
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
      await axios.post('http://127.0.0.1:5000/api/transfer', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-black mb-8">
          Transfer History for Token ID: {tokenId}
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-black mb-6">Transaction History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No transfer records found.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {history.map((entry, idx) => (
                <li 
                  key={idx} 
                  className="p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-all bg-gray-50"
                >
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-black text-sm">From:</span>
                      <p className="font-mono text-gray-700 text-xs mt-1 break-all">
                        {entry.from}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-black text-sm">To:</span>
                      <p className="font-mono text-gray-700 text-xs mt-1 break-all">
                        {entry.to}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-black">Transfer Ownership</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            You are the current owner. Enter the new wallet address to transfer ownership:
          </p>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-inter bg-gray-50"
              placeholder="Enter Recipient Wallet Address (Base58)"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
            />
            <button
              onClick={handleTransfer}
              disabled={loading || !newOwner.trim()}
              className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
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
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
    </div>
  );
};

export default TransferHistory;