'use client';

import Link from 'next/link'
import { Search, ShoppingCart, Menu, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/CartContext'
import { UserMenu } from '@/components/auth/UserMenu'

export function Header() {
  const { state, toggleCart } = useCart();
  return (
    <header className="sticky top-0 z-50 bg-tfm-navy text-white">
      {/* Top banner */}
      <div className="bg-tfm-navy-dark px-4 py-2 text-center text-sm">
        <p>Free shipping on orders over $35 shipped by TFMshop</p>
      </div>

      {/* Main header */}
      <div className="border-b border-tfm-navy-light">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-tfm-navy-light lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-xl font-bold">TFMshop</div>
              </Link>
            </div>

            {/* Delivery location */}
            <div className="hidden items-center space-x-1 text-sm lg:flex">
              <MapPin className="h-4 w-4" />
              <div>
                <div className="text-xs text-gray-300">Deliver to</div>
                <div className="font-semibold">New York 10001</div>
              </div>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <form action="/search" method="GET" className="flex">
                <select name="category" className="bg-gray-200 text-gray-900 px-3 py-2 rounded-l-md border-r-0 text-sm focus:outline-none">
                  <option value="All">All</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Books">Books</option>
                </select>
                <Input
                  type="search"
                  name="q"
                  placeholder="Search TFMshop"
                  className="flex-1 rounded-none border-0 bg-white text-gray-900 focus:ring-2 focus:ring-amazon-orange"
                />
                <Button type="submit" variant="amazon" className="rounded-l-none px-4">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-4">
              {/* Language/Country */}
              <div className="hidden items-center space-x-1 text-sm lg:flex">
                <span>🇺🇸</span>
                <span>EN</span>
              </div>

              {/* Account */}
              <div className="hidden lg:flex">
                <UserMenu />
              </div>

              {/* Orders */}
              <Link href="/orders" className="hidden flex-col text-xs hover:text-gray-300 lg:flex">
                <span>Returns</span>
                <span className="font-semibold">& Orders</span>
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden flex-col text-xs hover:text-gray-300 lg:flex">
                <span>Your</span>
                <span className="font-semibold">Wishlist</span>
              </Link>

              {/* Cart */}
              <button 
                onClick={toggleCart}
                className="flex items-center space-x-1 hover:text-gray-300 focus:outline-none"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                      {state.itemCount > 99 ? '99+' : state.itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden font-semibold lg:block">Cart</span>
              </button>

              {/* Mobile account */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-tfm-navy-light lg:hidden">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="bg-tfm-navy-light">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex h-10 items-center space-x-6 text-sm">
            <Button variant="ghost" className="text-white hover:bg-tfm-navy-dark h-full px-3">
              <Menu className="mr-2 h-4 w-4" />
              All
            </Button>
            <Link href="/category/electronics" className="hover:text-gray-300">
              Electronics
            </Link>
            <Link href="/category/clothing" className="hover:text-gray-300">
              Fashion
            </Link>
            <Link href="/category/home-garden" className="hover:text-gray-300">
              Home & Garden
            </Link>
            <Link href="/category/books" className="hover:text-gray-300">
              Books
            </Link>
            <Link href="/deals" className="hover:text-gray-300">
              Today&apos;s Deals
            </Link>
            <Link href="/saved" className="hover:text-gray-300">
              Saved Items
            </Link>
            <Link href="/compare" className="hover:text-gray-300">
              Compare
            </Link>
            <Link href="/reviews" className="hover:text-gray-300">
              Reviews
            </Link>
            <Link href="/help" className="hover:text-gray-300">
              Customer Service
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
