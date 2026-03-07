import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import VerifyProduct from './pages/VerifyProduct';
import UserLogin from './pages/UserLogin';
import TransferHistory from './pages/TransferHistory';
import Inventory from './pages/Inventory';

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
    <div className="min-h-screen w-full bg-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #f7f7f7 1px, transparent 1px), linear-gradient(180deg, #f7f7f7 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white shadow-sm">
        <Link className="text-xl font-bold text-gray-800 hover:text-black transition" to="/">
          Verify Product
        </Link>
        <div className="flex items-center space-x-4">
          {userAddress ? (
            <>
              <span className="hidden sm:inline-block text-gray-500 font-mono text-sm px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-all"
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-medium transition-all"
            >
              User Login
            </Link>
          )}
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<VerifyProduct userAddress={userAddress} />} />
        <Route path="/login" element={<UserLogin setUserAddress={setUserAddress} />} />
        <Route path="/inventory" element={<Inventory userAddress={userAddress} />} />
        <Route path="/history/:tokenId" element={<TransferHistory userAddress={userAddress} />} />
      </Routes>
    </div>
  );
}

export default App;
