"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, WalletIcon } from 'lucide-react';
import Image from 'next/image';
import Link  from 'next/link';
import { useRouter } from 'next/navigation';


// Types
interface FAQ {
  question: string;
  answer: string;
}

interface FAQItemProps extends FAQ {
  key?: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="border border-gray-700 rounded-lg bg-gradient-to-br from-black via-gray-900 to-gray-800 mb-2">
      <button
        className="flex justify-between items-center w-full py-5 px-6 text-left text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-300" /> : <ChevronDown className="h-5 w-5 text-gray-300" />}
      </button>
      <div
        className={`transition-all duration-300 ease-out overflow-hidden px-6 ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="pb-5 text-gray-300">{answer}</p>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const router = useRouter();

  // Check if the user is already connected to MetaMask on component mount
  useEffect(() => {
    const storedAccount = localStorage.getItem('walletAddress');
    if (storedAccount) {
      setAccount(storedAccount);
      router.push('/marketplace'); // Redirect if account is found
    }
  }, [router]);

  // Connect MetaMask or any Ethereum wallet
  const connectMetaMask = async (): Promise<void> => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const userAccount = accounts[0];
        setAccount(userAccount);
        console.log('Connected to MetaMask:', userAccount);
        localStorage.setItem('walletAddress', userAccount);

        // Navigate to the marketplace page after successful connection
        router.push('/marketplace');
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask not found. Please install MetaMask to connect.');
    }
  };


  const faqs: FAQ[] = [
    {
      question: "What is TradeXchange?",
      answer: "TradeXchange is a decentralized marketplace for trading digital assets and points without real money."
    },
    {
      question: "Is TradeXchange safe to use?",
      answer: "Yes, TradeXchange prioritizes security and uses advanced encryption to protect user data and assets."
    },
    {
      question: "Can I start trading with just $1?",
      answer: "TradeXchange uses a point system instead of real money. You can start with a small number of points to begin trading."
    },
    {
      question: "Is there an exchange limit between assets?",
      answer: "Exchange limits may vary depending on the type of digital asset. Please check our trading rules for specific details."
    },
    {
      question: "How do I deposit or withdraw digital assets?",
      answer: "To deposit or withdraw digital assets, simply navigate to the 'Wallet' section in your account settings and follow the instructions for the respective asset."
    },
    {
      question: "Are there any fees for trading on TradeXchange?",
      answer: "TradeXchange has a small transaction fee for each trade to cover network costs. The fee percentage is clearly displayed before finalizing your trade."
    },
    {
      question: "Can I trade physical goods on TradeXchange?",
      answer: "Currently, TradeXchange only supports the trading of digital assets and points. Physical goods are not available for exchange on the platform."
    },
  ];

  return (
    <div className="relative min-h-screen bg-dark-green-to-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-radial-green-tl opacity-40"></div>
        <div className="absolute bottom-1/4 right-0 w-1/3 h-1/3 bg-radial-green-br opacity-40"></div>
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 mt-1 fixed top-0 left-0 right-0 z-35">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={56} height={56} className="mr-2" />
          <span className="text-4xl font-bold">Crypto Bazaar</span>
        </div>

          <div className="flex space-x-10 text-xl cursor-pointer justify-center flex-grow">
            <Link href="#Home" className="text-white hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link href="#Marketplace" className="text-white hover:text-green-400 transition-colors">
              Marketplace
            </Link>
            <Link href="#FAQ" className="text-white hover:text-green-400 transition-colors">
              FAQ
            </Link>
            <Link href="#Contact" className="text-white hover:text-green-400 transition-colors">
              Contact
            </Link>
          </div>

        <div className='flex items-center space-x-4 mr-20'>
              <button
                onClick={connectMetaMask}
                className="w-full bg-orange-500 p-2 rounded-xl text-white flex items-center justify-center"
              >
                <WalletIcon className="mr-2" /> Connect Wallet
              </button>
          </div>
      </nav>

      {/* Main Content */}
      <section id="Home" className="relative">
        <main className="flex p-8 mt-20">
          {/* Left Side */}
          <div className="w-1/2 pr-8">
            <div className="ml-5 text-center rounded-3xl w-40 text-lg py-2 mb-4 border border-white">
              Start Today
            </div>
            <h1 
              className="text-5xl font-bold mb-4 ml-5"
              style={{
                background: 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.1), #ffffff, rgba(0, 0, 0, 0.1))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trade Digital Assets in a Decentralized Marketplace
            </h1>
            <p className="mb-6 mt-8 ml-5 text-2xl">
              <span className="block">Explore, trade, and earn in a secure platform where digital assets</span>
              <span className="block">and points flow seamlessly without real money</span>
            </p>
            {/* Add your CryptoChart component here */}
          </div>

          {/* Right Side */}
          <div className="w-1/2 flex flex-col items-end">
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg mb-4 w-full">
              <div className="flex justify-between mb-2">
                <span>Last month</span>
                <span>This month</span>
              </div>
              <div className="flex justify-between text-2xl font-bold">
                <span>$409.36</span>
                <span>$1,024</span>
              </div>
            </div>
            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg w-full">
              <p>Buy USDT</p>
              <p>1 USDT = 1.05 USD</p>
            </div>
          </div>
        </main>
      </section>

      {/* Marketplace Section */}
      <section className="p-8 mt-2" id="Marketplace">
        <h2 
          className="text-5xl font-bold mb-4 ml-5"
          style={{
            background: 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.1), #ffffff, rgba(0, 0, 0, 0.1))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          MARKETPLACE
        </h2>
        <div className="flex gap-10">
          <div className="bg-gray-600 bg-opacity-40 h-60 w-60 mx-auto mt-20"></div>
          <div className="bg-gray-600 bg-opacity-40 h-60 w-60 mx-auto mt-20"></div>
          <div className="bg-gray-600 bg-opacity-40 h-60 w-60 mx-auto mt-20"></div>
          <div className="bg-gray-600 bg-opacity-40 h-60 w-60 mx-auto mt-20"></div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="text-white p-8" id="FAQ">
        <h2 
          className="text-5xl font-bold mb-8 ml-5"
          style={{
            background: 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.1), #ffffff, rgba(0, 0, 0, 0.1))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Frequently Asked Questions
        </h2>
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-16">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="text-white p-8" id="Contact">
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Buy Crypto</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-slate-200 cursor-pointer">Exchanges</li>
              <li className="hover:text-slate-200 cursor-pointer">Watchlist</li>
              <li className="hover:text-slate-200 cursor-pointer">Portfolio</li>
              <li className="hover:text-slate-200 cursor-pointer">NFT</li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-slate-200 cursor-pointer">About Us</li>
              <li className="hover:text-slate-200 cursor-pointer">Careers</li>
              <li className="hover:text-slate-200 cursor-pointer">Blog</li>
              <li className="hover:text-slate-200 cursor-pointer">Security</li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Help Center</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-slate-200 cursor-pointer">Contact Us</li>
              <li className="hover:text-slate-200 cursor-pointer">System Status</li>
              <li className="hover:text-slate-200 cursor-pointer">Area of Availability</li>
              <li className="hover:text-slate-200 cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Never miss anything crypto when you're on the go</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;