import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

// Ensure Buffer is available globally for browser compatibility
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const PROGRAM_ID = new PublicKey("7myMommiSpYzsUx6zBj1pLPmaR4rFfDYMDBr97TFnRmW");

const Login = ({ setIsLoggedIn, setUserAddress }) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [status, setStatus] = useState("Connect your wallet to continue");
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && publicKey) {
      checkWhitelist(publicKey);
    } else {
      setStatus("Connect your wallet to continue");
    }
  }, [connected, publicKey]);

  const checkWhitelist = async (userPubkey) => {
    try {
      setChecking(true);
      setStatus("⏳ Checking whitelist...");

      // Derive the PDA for the user's whitelist entry
      const [whitelistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("whitelist"), userPubkey.toBuffer()],
        PROGRAM_ID
      );

      // Check if the account exists
      const accountInfo = await connection.getAccountInfo(whitelistPda);

      if (accountInfo !== null) {
        // Technically we should deserialize it with Anchor, but if the PDA exists and was initialized, 
        // the manufacturer is whitelisted. (Assuming only admin can initialize or revoke).
        // Since we have an `is_whitelisted` boolean as the first data byte (after 8 byte discriminator),
        // we can check if it's true.
        const isWhitelisted = accountInfo.data[8] === 1;

        if (isWhitelisted) {
          setStatus("✅ Whitelisted. Redirecting...");
          setIsLoggedIn(true);
          setUserAddress(userPubkey.toBase58());
          setTimeout(() => navigate("/Dashboard"), 1000);
        } else {
          setStatus("❌ Your whitelist status is inactive.");
        }
      } else {
         setStatus("❌ You are not whitelisted as a manufacturer.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setStatus(`⚠️ Login failed: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex justify-center mb-2">
            <h1 className="text-3xl font-extrabold tracking-wide text-black">
              TAG<span className="text-gray-400">-</span>IN
            </h1>
          </div>

          <p className="text-center text-gray-500 text-sm mb-8">
            Sign in to continue
          </p>

          <div className="space-y-3 flex flex-col items-center">
            {/* Wallet Multi Button from Solana adapter */}
            <WalletMultiButton className="!bg-black !w-full !justify-center !rounded-2xl !py-4" />

            {/* Back to Home Button */}
            <Link to="/" className="w-full">
              <button className="w-full bg-white hover:bg-gray-50 text-black px-6 py-4 rounded-2xl border border-gray-200 transition-all font-medium mt-3">
                Back to home
              </button>
            </Link>
          </div>

          {/* Status Message */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {status}
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Make sure you're connected to Solana Devnet
        </p>
      </div>
    </div>
  );
};

export default Login;