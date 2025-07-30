import React from 'react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* Back to top */}
      <div 
        className="bg-gray-700 hover:bg-gray-600 text-center py-4 cursor-pointer transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="text-[14px]">Back to top</span>
      </div>

      {/* Main footer content */}
      <div className="max-w-[1440px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Get to Know Us */}
          <div>
            <h3 className="font-bold text-[16px] mb-4">Get to Know Us</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">About TFMshop</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Investor Relations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">TFMshop Devices</a></li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h3 className="font-bold text-[16px] mb-4">Make Money with Us</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Sell products on TFMshop</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Sell on TFMshop Business</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Sell apps on TFMshop</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Become an Affiliate</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Advertise Your Products</a></li>
            </ul>
          </div>

          {/* TFMshop Payment Products */}
          <div>
            <h3 className="font-bold text-[16px] mb-4">TFMshop Payment Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">TFMshop Business Card</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Shop with Points</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Reload Your Balance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">TFMshop Currency Converter</a></li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="font-bold text-[16px] mb-4">Let Us Help You</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Your Account</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Your Orders</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Shipping Rates & Policies</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Returns & Replacements</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-[14px]">Help</a></li>
            </ul>
          </div>
        </div>

        {/* Logo and language selector */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-[20px] font-bold mb-4 md:mb-0">
              TFMshop<span className="text-orange-400">.com</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                🌍 English
              </Button>
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                $ USD - U.S. Dollar
              </Button>
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                🇺🇸 United States
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 text-[12px] text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Conditions of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Notice</a>
            <a href="#" className="hover:text-white transition-colors">Interest-Based Ads</a>
            <span>© 1996-2024, TFMshop.com, Inc. or its affiliates</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;