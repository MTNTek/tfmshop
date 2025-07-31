'use client';

import { useState } from 'react';
import Link from 'next/link'
import Image from 'next/image';
import { User, Package, Heart, CreditCard, MapPin, Settings, Bell, Shield, Award, DollarSign, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils';

// Mock user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  joinDate: '2023-01-15',
  membershipLevel: 'Prime',
  profileImage: '/api/placeholder/100/100',
  stats: {
    totalOrders: 24,
    totalSpent: 2847.99,
    savedItems: 12,
    reviewsWritten: 8
  }
};

export default function AccountPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={userData.profileImage}
                alt={userData.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hello, {userData.name}</h1>
                <p className="text-gray-600">Welcome back to your TFMshop account</p>
                <div className="flex items-center mt-2">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">{userData.membershipLevel} Member since {new Date(userData.joinDate).getFullYear()}</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(userData.stats.totalSpent)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Saved Items</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.savedItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Reviews Written</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.reviewsWritten}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Your Orders */}
          <Link href="/orders" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Orders</h2>
                  <p className="text-sm text-gray-600">Track, return, or buy things again</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">{userData.stats.totalOrders} orders</p>
                </div>
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Saved Items & Wishlist */}
          <Link href="/saved" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Saved Items</h2>
                  <p className="text-sm text-gray-600">View and manage your wishlist</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">{userData.stats.savedItems} saved items</p>
                </div>
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Login & Security */}
          <Link href="/account/security" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Login & Security</h2>
                  <p className="text-sm text-gray-600">Edit login, name, and mobile number</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Account secured</p>
                </div>
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Payment Methods */}
          <Link href="/account/payment" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-600">Manage your payment options</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">2 cards on file</p>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Addresses */}
          <Link href="/account/addresses" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Addresses</h2>
                  <p className="text-sm text-gray-600">Edit addresses for orders and gifts</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">3 addresses</p>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                  <p className="text-xs text-red-600 font-medium mt-1">3 unread</p>
                </div>
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-orange-500" />
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/orders">View Recent Orders</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/compare">Compare Products</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/deals">Browse Deals</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
