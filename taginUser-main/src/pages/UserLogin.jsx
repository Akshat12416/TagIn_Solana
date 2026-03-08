import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaEthereum } from "react-icons/fa"; // We'll keep the icon for layout but feel free to change

const UserLogin = ({ setUserAddress }) => {
  const { publicKey, connected } = useWallet();
  const [status, setStatus] = useState("Connect your wallet to continue");
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && publicKey) {
      setUserAddress(publicKey.toBase58());
      setStatus("✅ Wallet connected. Redirecting...");
      setTimeout(() => navigate("/Inventory"), 1000);
    } else {
      setStatus("Connect your wallet to continue");
    }
  }, [connected, publicKey, navigate, setUserAddress]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6 relative">
      <div className="bg-[#09090b] p-8 rounded-3xl shadow-2xl w-[400px] flex flex-col items-center space-y-6 border border-white/10 backdrop-blur-xl z-10">
        <h1 className="text-2xl font-semibold text-white font-space-grotesk tracking-wide text-center">User Login</h1>
        <p className="text-sm text-center text-gray-400 font-inter">{status}</p>
        
        <div className="w-full flex justify-center mt-4">
          <WalletMultiButton className="!bg-[#5282E1] hover:!bg-[#3d68bc] !transition-colors !text-white !w-full !justify-center !rounded-2xl !py-4 !font-inter" />
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
