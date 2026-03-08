import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import VerifyProduct from './pages/VerifyProduct';
import UserLogin from './pages/UserLogin';
import TransferHistory from './pages/TransferHistory';
import Inventory from './pages/Inventory';
import taginLogo from './assets/tagin-logo-white.svg';

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const { disconnect } = useWallet();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await disconnect();
    setUserAddress(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Subtle dotted matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-[100] px-6 py-4 flex justify-between items-center border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl shadow-sm">
        <Link className="flex items-center gap-3 hover:opacity-80 transition-opacity" to="/">
          <img src={taginLogo} alt="TagIn Logo" className="h-6 w-auto" />
          <span className="text-xl font-bold text-white border-l border-white/20 pl-3 py-1 font-space-grotesk">Verify Product</span>
        </Link>
        <div className="flex items-center space-x-4">
          {userAddress ? (
            <>
              <span className="hidden sm:inline-block text-gray-300 font-mono text-sm px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all"
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-[#5282E1] text-white hover:bg-[#3d68bc] rounded-xl text-sm font-medium transition-all shadow-lg shadow-[#5282E1]/20 font-inter"
            >
              User Login
            </Link>
          )}
        </div>
      </nav>

      {/* Routes */}
      <div className="relative z-10 min-h-[calc(100vh-5rem)]">
        <Routes>
        <Route path="/" element={<VerifyProduct userAddress={userAddress} />} />
        <Route path="/login" element={<UserLogin setUserAddress={setUserAddress} />} />
        <Route path="/inventory" element={<Inventory userAddress={userAddress} />} />
        <Route path="/history/:tokenId" element={<TransferHistory userAddress={userAddress} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
