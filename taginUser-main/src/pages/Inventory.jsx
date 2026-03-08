import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Inventory({ userAddress }) {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      if (!userAddress) return;
      try {
        const res = await axios.get(`http://${window.location.hostname}:5000/api/products`);
        const allProducts = res.data;

        const ownedProducts = allProducts.filter(product => product.owner === userAddress);
        setProducts(ownedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchInventory();
  }, [userAddress]);

  return (
    <div className="min-h-screen bg-black p-6 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Subtle dotted matrix grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-white font-space-grotesk">
            Your Inventory
          </h2>

          <button 
            className="bg-[#09090b] hover:bg-white/5 text-white px-6 py-3 rounded-2xl border border-white/10 transition-all font-medium shadow-md font-inter"
            onClick={() => (window.location.href = "http://localhost:5177")}
          >
            Try Sneaker Prediction
          </button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-[#09090b] rounded-3xl border border-white/10 shadow-2xl p-12 text-center backdrop-blur-xl">
            <p className="text-gray-400 text-lg font-inter">No products owned by you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div 
                key={product.tokenId} 
                className="bg-[#09090b] border border-white/10 p-6 rounded-3xl shadow-2xl hover:shadow-[#5282E1]/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 backdrop-blur-xl"
              >
                <h3 className="text-2xl font-bold mb-4 text-white font-space-grotesk">{product.name}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="font-semibold text-gray-300 text-sm font-inter">Token ID:</span>
                    <span className="text-white text-sm font-inter">{product.tokenId}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="font-semibold text-gray-300 text-sm font-inter">Model:</span>
                    <span className="text-white text-sm font-inter">{product.model}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="font-semibold text-gray-300 text-sm font-inter">Serial:</span>
                    <span className="text-white text-sm font-inter">{product.serial}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-[#5282E1] hover:bg-[#3d68bc] text-white px-6 py-3 rounded-2xl shadow-xl transition-all font-medium font-inter"
                  onClick={() => navigate(`/history/${product.tokenId}`)}
                >
                  View Transfer History
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;