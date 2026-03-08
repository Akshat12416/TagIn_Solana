import { useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import Landing from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Registerproduct from "./pages/Registerproduct";
import TransferOwnership from "./pages/TransferOwnership";
import taginLogo from "./assets/tagin-logo-white.svg";
import { HiMenu, HiX } from "react-icons/hi";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const { disconnect } = useWallet();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await disconnect();
    setIsLoggedIn(false);
    setUserAddress("");
    navigate("/");
  };

  const navItems = [
    { name: "Register Product", path: "/Registerproduct" },
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Transfer Ownership", path: "/transfer" },
    { name: "Reports", path: "/reports" },
    { name: "Analytics", path: "/analytics" },
  ];

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setUserAddress={setUserAddress}
            />
          }
        />

        {/* Protected routes (require login) */}
        {isLoggedIn ? (
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-black">
                {/* Navbar */}
                <nav className="bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-[100] shadow-sm">
                  <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="flex items-center justify-between h-16 py-10">
                      {/* Logo section */}
                      <div className="flex items-center gap-4">
                        <img src={taginLogo} alt="TagIn Logo" className="h-6 w-auto" />

                      </div>

                      {/* Desktop Navigation links */}
                      <div className="hidden md:flex items-center gap-3">
                        <ul className="flex items-center gap-2">
                          {navItems.map((item, index) => (
                            <li key={index}>
                              <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                  `block px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${isActive
                                    ? "bg-[#5282E1] text-white shadow-lg shadow-[#5282E1]/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                  }`
                                }
                              >
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>

                        {/* User Address Display (Desktop) */}
                        {userAddress && (
                          <div className="ml-2 flex items-center gap-2">
                            <div className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-mono text-gray-300 transition-all">
                              {userAddress.slice(0, 6)}...
                              {userAddress.slice(-4)}
                            </div>
                            <button
                              onClick={handleLogout}
                              className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl text-sm font-medium transition-all"
                            >
                              Disconnect
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mobile menu button */}
                      <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                      </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (
                      <div className="md:hidden py-4 border-t border-white/10">
                        <ul className="space-y-2">
                          {navItems.map((item, index) => (
                            <li key={index}>
                              <NavLink
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `block px-6 py-3 rounded-2xl text-base font-medium transition-all ${isActive
                                    ? "bg-[#5282E1] text-white shadow-lg shadow-[#5282E1]/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                  }`
                                }
                              >
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>

                        {/* User Address Display (Mobile) */}
                        {userAddress && (
                          <div className="mt-4 flex flex-col gap-2">
                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-gray-300 text-center">
                              {userAddress.slice(0, 10)}...
                              {userAddress.slice(-8)}
                            </div>
                            <button
                              onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                              }}
                              className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl text-sm font-medium w-full transition-all text-center"
                            >
                              Disconnect
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </nav>

                {/* Main Content */}
                <div className="min-h-[calc(100vh-5rem)] relative">
                  <Routes>
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route
                      path="/Registerproduct"
                      element={<Registerproduct />}
                    />
                    <Route path="/transfer" element={<TransferOwnership />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/analytics" element={<Analytics />} />{" "}
                    {/* 👈 NEW */}
                    <Route path="*" element={<Navigate to="/Dashboard" />} />
                  </Routes>
                </div>
              </div>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
