import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, User, Package, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [cartCount] = useState(3);

  return (
    <header className="bg-[#000f0a] text-white">
      {/* Top bar */}
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-lg md:text-xl font-bold">
              TFMshop<span className="text-orange-400">.com</span>
            </div>
          </div>

          {/* Location (hidden on mobile) */}
          <div className="hidden md:flex items-center text-xs">
            <MapPin className="w-4 h-4 mr-1" />
            <div>
              <div className="text-xs text-gray-300 text-[11px]">Deliver to</div>
              <div className="font-semibold text-sm">New York 10001</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-r-none border-gray-300 bg-gray-100 text-black hover:bg-gray-200 px-3 hidden md:flex items-center"
                  >
                    All
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Electronics</DropdownMenuItem>
                  <DropdownMenuItem>Books</DropdownMenuItem>
                  <DropdownMenuItem>Home & Garden</DropdownMenuItem>
                  <DropdownMenuItem>Sports</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Input 
                placeholder="Search TFMshop" 
                className="border-gray-300 rounded-none md:rounded-l-none flex-1"
              />
              
              <Button className="bg-orange-400 hover:bg-orange-500 text-black rounded-l-none px-4">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Language (hidden on mobile) */}
            <div className="hidden md:flex items-center text-xs">
              <span className="mr-1">🇺🇸</span>
              <span>EN</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </div>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-[#001f14] flex flex-col items-start p-2">
                  <span className="text-[11px] hidden md:block">Hello, Sign in</span>
                  <span className="text-sm font-semibold flex items-center">
                    Account & Lists
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sign In</DropdownMenuItem>
                <DropdownMenuItem>Create Account</DropdownMenuItem>
                <DropdownMenuItem>Your Account</DropdownMenuItem>
                <DropdownMenuItem>Your Orders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Orders */}
            <Button variant="ghost" className="text-white hover:bg-[#001f14] flex flex-col items-start p-2 hidden md:flex">
              <span className="text-[11px]">Returns</span>
              <span className="text-sm font-semibold">& Orders</span>
            </Button>

            {/* Cart */}
            <Button variant="ghost" className="text-white hover:bg-[#001f14] relative p-2">
              <div className="flex items-end">
                <ShoppingCart className="w-8 h-8" />
                <span className="text-orange-400 font-bold text-lg ml-1">{cartCount}</span>
              </div>
              <span className="text-sm font-semibold hidden md:block">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden bg-[#001f14] max-w-[1440px] mx-auto px-4 py-2">
        <Button variant="ghost" className="text-white hover:bg-[#000f0a]">
          <Menu className="w-5 h-5 mr-2" />
          All
        </Button>
      </div>
    </header>
  );
};

export default Header;