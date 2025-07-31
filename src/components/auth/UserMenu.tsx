'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Package, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { state, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!state.user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-white hover:bg-tfm-navy-light">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="bg-white text-tfm-navy hover:bg-gray-100">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:bg-tfm-navy-light px-3 py-2 rounded-md transition-colors"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium">
            {state.user.name}
          </div>
          <div className="text-xs text-white/80">{state.user.email}</div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="font-medium text-gray-900">
              {state.user.name}
            </div>
            <div className="text-sm text-gray-500">{state.user.email}</div>
            {state.user.isPrime && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Prime Member
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              <span>My Account</span>
            </Link>

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
