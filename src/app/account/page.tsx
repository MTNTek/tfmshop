import Link from 'next/link'
import { User, Package, Heart, CreditCard, MapPin, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Account</h1>
          <p className="text-gray-600">Manage your account settings and view your activity</p>
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
                </div>
                <Package className="h-8 w-8 text-amazon-orange" />
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
                </div>
                <Settings className="h-8 w-8 text-amazon-orange" />
              </div>
            </div>
          </Link>

          {/* Prime */}
          <Link href="/prime" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Prime</h2>
                  <p className="text-sm text-gray-600">View benefits and payment settings</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">prime</div>
              </div>
            </div>
          </Link>

          {/* Your Addresses */}
          <Link href="/account/addresses" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Addresses</h2>
                  <p className="text-sm text-gray-600">Edit addresses for orders and gifts</p>
                </div>
                <MapPin className="h-8 w-8 text-amazon-orange" />
              </div>
            </div>
          </Link>

          {/* Payment Options */}
          <Link href="/account/payment" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Options</h2>
                  <p className="text-sm text-gray-600">Edit or add payment methods</p>
                </div>
                <CreditCard className="h-8 w-8 text-amazon-orange" />
              </div>
            </div>
          </Link>

          {/* Your Lists */}
          <Link href="/account/lists" className="block">
            <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Lists</h2>
                  <p className="text-sm text-gray-600">View, modify, and share your lists</p>
                </div>
                <Heart className="h-8 w-8 text-amazon-orange" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Recent Activity</h2>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #123-4567890-1234567</p>
                    <p className="text-sm text-gray-600">Placed on December 15, 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">$1,149.00</p>
                  <p className="text-sm text-green-600">Delivered</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Added to Wishlist</p>
                    <p className="text-sm text-gray-600">Nike Air Max 270</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">2 days ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Updated</p>
                    <p className="text-sm text-gray-600">Changed delivery address</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">1 week ago</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/account/activity">
                <Button variant="outline">View All Activity</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Service */}
        <div className="mt-12">
          <div className="rounded-lg bg-amazon-orange bg-opacity-10 p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Need help?</h3>
            <p className="mb-4 text-gray-700">
              Our customer service team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex space-x-4">
              <Link href="/help">
                <Button variant="outline">Visit Help Center</Button>
              </Link>
              <Link href="/contact">
                <Button variant="amazon">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Your Account - TFMshop',
  description: 'Manage your TFMshop account settings, orders, and preferences',
}
