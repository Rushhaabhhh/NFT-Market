"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import logo from "../../public/logo.png";
import { WalletIcon, Search, User } from 'lucide-react';
import Image from 'next/image';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}

const Navbar: React.FC = () => {
  const router = useRouter();

  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  // Retrieve MetaMask account from localStorage on mount
  useEffect(() => {
    const storedAccount = localStorage.getItem('walletAddress');
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, []);




  const handleLogout = async (): Promise<void> => {
    try {
      await axios.post('https://tradexchange-7rcv.onrender.com/user/logout'); 
      router.push('/dashboard'); 
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-transparent z-50 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-8 align-center">
          <a href="/marketplace" className="flex items-center py-2">
            <Image src={logo} alt="Logo" className="h-9 w-9 mr-2" />
            <span className="text-2xl font-bold text-white">TradeXchange</span>
          </a>
          <div className="border-l-2 border-white h-6"></div>
          <button
            onClick={() => router.push('/create')} 
            className="text-white text-2xl hover:text-opacity-80"
          >
            Create
          </button>
        </div>

        {/* Search Bar Centered */}
        <div className="relative flex-grow flex justify-center">
          <div className="relative text-gray-600 text-md">
            <input
              type="search"
              placeholder="Search"
              className="bg-gray-800 bg-opacity-50 text-white rounded-full w-full py-3 px-10 pl-12 shadow-md focus:outline-none"
            />
            <div className="absolute top-0 left-0 mt-3 ml-4">
              <Search className="text-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mr-24">
          <div>
            <button
              className="bg-gradient-to-r from-orange-400 to-orange-500 px-3 py-2 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all"
            >
              <WalletIcon className="mr-2" /> {account ? `${account.slice(0, 6)}` : 'Connect Wallet'}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              className="bg-gray-700 bg-opacity-40 px-4 py-2 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all"
            >
              <User className="mr-2" /> Profile
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-gray-700 shadow-lg rounded-lg w-48 z-20">
                <a href="/profile" className="block px-4 py-2 text-opacity-80 text-white hover:text-opacity-100">My Profile</a>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-opacity-80 text-white hover:text-opacity-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
