import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, X, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Mock wishlist data - in real app this would come from user's saved items
const wishlistItems = [
  {
    id: '1',
    name: 'MacBook Pro 16-inch',
    brand: 'Apple',
    price: 2499.00,
    comparePrice: 2699.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.8,
    reviewCount: 1247,
    isPrime: true,
    isInStock: true,
    dateAdded: '2025-07-25',
    href: '/product/macbook-pro-16'
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    rating: 4.6,
    reviewCount: 892,
    isPrime: true,
    isInStock: true,
    dateAdded: '2025-07-20',
    href: '/product/sony-wh-1000xm5'
  },
  {
    id: '3',
    name: 'iPad Air (5th generation)',
    brand: 'Apple',
    price: 599.00,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    rating: 4.7,
    reviewCount: 567,
    isPrime: true,
    isInStock: false,
    dateAdded: '2025-07-15',
    href: '/product/ipad-air-5th-gen'
  },
  {
    id: '4',
    name: 'Nike Air Jordan 1 Retro High',
    brand: 'Nike',
    price: 170.00,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
    rating: 4.5,
    reviewCount: 1156,
    isPrime: true,
    isInStock: true,
    dateAdded: '2025-07-10',
    href: '/product/jordan-1-retro-high'
  }
]

const renderStars = (rating: number) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐')
  }
  if (hasHalfStar) {
    stars.push('⭐')
  }
  
  return stars.join('')
}

export default function WishlistPage() {
  const totalItems = wishlistItems.length
  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <p className="text-gray-600">
            {totalItems} items • Total value: {formatPrice(totalValue)}
          </p>
        </div>

        {/* Wishlist Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button variant="amazon">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share List
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amazon-orange focus:outline-none">
              <option>Date Added</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Popularity</option>
            </select>
          </div>
        </div>

        {/* Wishlist Items */}
        {totalItems === 0 ? (
          <div className="py-16 text-center">
            <Heart className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-600">Start browsing and add items you love!</p>
            <Link href="/">
              <Button variant="amazon" className="mt-6">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Remove from wishlist button */}
                <button className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </button>

                {/* Product Image */}
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
                  <Link href={item.href}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">{item.brand}</div>
                  
                  <h3 className="font-medium text-gray-900 line-clamp-2">
                    <Link href={item.href} className="hover:text-amazon-orange">
                      {item.name}
                    </Link>
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="text-yellow-400">{renderStars(item.rating)}</span>
                    <span className="text-gray-600">({item.reviewCount.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Prime badge */}
                  {item.isPrime && (
                    <div className="text-xs text-blue-600 font-bold">prime</div>
                  )}

                  {/* Stock status */}
                  <div className="text-sm">
                    {item.isInStock ? (
                      <span className="text-green-600">✓ In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Date added */}
                  <div className="text-xs text-gray-500">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    <Button 
                      variant="amazon" 
                      size="sm" 
                      className="w-full"
                      disabled={!item.isInStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {item.isInStock ? 'Add to Cart' : 'Notify When Available'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Viewed Section */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">You might also like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* This would be populated with recommended products */}
            <div className="rounded-lg border border-gray-200 p-4 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <p className="text-sm text-gray-600">
                Recommendations based on your wishlist
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-center">
              <div className="mb-4 text-4xl">⭐</div>
              <p className="text-sm text-gray-600">
                Top-rated similar products
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-center">
              <div className="mb-4 text-4xl">🔥</div>
              <p className="text-sm text-gray-600">
                Trending in your categories
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-center">
              <div className="mb-4 text-4xl">💰</div>
              <p className="text-sm text-gray-600">
                Price drop alerts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Your Wishlist - TFMshop',
  description: 'View and manage your saved items, create shopping lists, and get notifications',
}
