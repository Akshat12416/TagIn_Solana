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
    <div
      className="flex items-center justify-center min-h-screen p-6"
      style={{
        backgroundColor: "#fff",
        backgroundImage:
          "linear-gradient(90deg, #f7f7f7 1px, transparent 1px), linear-gradient(180deg, #f7f7f7 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-md w-[400px] flex flex-col items-center space-y-6 border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">User Login</h1>
        <p className="text-sm text-center text-gray-600">{status}</p>
        
        <div className="w-full flex justify-center">
          <WalletMultiButton className="!bg-black !w-full !justify-center !rounded-lg !py-3" />
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
