
"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Bitcoin, X, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from '../_components/navbar';

type Asset = {
  _id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  owner?: string;
};

type AssetCardProps = {
  asset: Asset;
  handleAddToCart: (asset: Asset) => void;
  isOwnedByUser: boolean;
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, handleAddToCart, isOwnedByUser }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-gray-800 rounded-lg shadow-lg text-white pb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={asset.image}
          alt={asset.title}
          className={`w-full h-64 object-cover transition-transform duration-300 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
      </div>
      <h3 className="text-xl font-bold px-4 py-2">{asset.title}</h3>
      <p className="text-gray-400 px-4">{asset.description}</p>
      <p className="text-lg font-semibold px-4 py-1">{asset.price} ETH</p>

      {!isOwnedByUser && isHovered && (
        <button
          onClick={() => handleAddToCart(asset)}
          className="absolute left-0 right-0 mx-auto w-full px-4 py-2 bg-blue-600 rounded-b-lg hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center"
        >
          <ShoppingCart className="mr-2" />
          Buy Now
        </button>
      )}
    </div>
  );
};

const Marketplace: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cart, setCart] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get<Asset[]>('https://tradexchange-7rcv.onrender.com/asset/');
        setAssets(response.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setErrorMessage('Failed to fetch assets. Please try again later.');
      }
    };

    fetchAssets();
  }, []);

  const handleAddToCart = (asset: Asset) => {
    setCart((prevCart) => [...prevCart, asset]);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleBuyAsset = async (asset: Asset) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setErrorMessage('User not authenticated. Please log in.');
      return;
    }


    try {
      const response = await axios.post(
        `https://tradexchange-7rcv.onrender.com/asset/buy/${asset._id}`,
        { userId }
      );
      setSuccessMessage(`Successfully purchased ${asset.title}`);
      setCart((prevCart) => prevCart.filter((item) => item._id !== asset._id));
      setAssets((prevAssets) =>
        prevAssets.map((a) => (a._id === asset._id ? { ...a, owner: userId } : a))
      );
    } catch (error: any) {
      console.error('Error buying asset:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to purchase asset. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Navbar />
      <button
        onClick={toggleModal}
        className="z-50 bg-gray-700 bg-opacity-40 px-4 py-2 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all fixed mt-6 right-2"
      >
        <ShoppingCart className="mx-auto mr-3" />
        Buy
        {cart.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full absolute -top-2 -right-2">
            {cart.length}
          </span>
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-end top-20">
          <div className="bg-gray-800 w-80 h-full shadow-lg p-6 text-white relative">
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item._id} className="bg-gray-700 p-4 rounded-lg flex justify-between">
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p>{item.price} ETH</p>
                    </div>
                    <Bitcoin size={24} />
                  </div>
                ))}
                <button
                  onClick={() => cart.forEach(handleBuyAsset)}
                  className="w-full py-2 mt-4 bg-blue-600 rounded-lg hover:bg-blue-500 transition-all"
                >
                  Proceed to Payment
                </button>
              </div>
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
        </div>
      )}

      <main className="pt-32 px-4">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset._id}
              asset={asset}
              handleAddToCart={handleAddToCart}
              isOwnedByUser={asset.owner === localStorage.getItem('userId')}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
