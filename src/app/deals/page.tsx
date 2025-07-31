import Image from 'next/image'
import Link from 'next/link'
import { Clock, Tag, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Deal interface
interface Deal {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  image: string;
  rating: number;
  reviewCount: number;
  isPrime: boolean;
  timeLeft?: string;
  claimed?: number;
  totalAvailable?: number;
}

// Mock deals data - in real app this would come from database
const dealCategories = [
  {
    id: 'lightning',
    title: 'Lightning Deals',
    subtitle: 'Limited time offers',
    icon: '⚡',
    deals: [
      {
        id: '1',
        name: 'Apple Watch Series 9',
        brand: 'Apple',
        originalPrice: 399.00,
        dealPrice: 299.00,
        discount: 25,
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400',
        rating: 4.6,
        reviewCount: 2341,
        timeLeft: '2h 15m',
        claimed: 68,
        totalAvailable: 100,
        isPrime: true
      },
      {
        id: '2',
        name: 'Samsung 65" QLED 4K TV',
        brand: 'Samsung',
        originalPrice: 1299.99,
        dealPrice: 899.99,
        discount: 31,
        image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
        rating: 4.4,
        reviewCount: 892,
        timeLeft: '1h 45m',
        claimed: 23,
        totalAvailable: 50,
        isPrime: true
      }
    ]
  },
  {
    id: 'daily',
    title: 'Deal of the Day',
    subtitle: 'Up to 50% off',
    icon: '🌟',
    deals: [
      {
        id: '3',
        name: 'Dyson V15 Detect Vacuum',
        brand: 'Dyson',
        originalPrice: 749.99,
        dealPrice: 449.99,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        rating: 4.7,
        reviewCount: 1567,
        timeLeft: '18h 30m',
        isPrime: true
      }
    ]
  },
  {
    id: 'weekly',
    title: 'Weekly Deals',
    subtitle: 'Save all week long',
    icon: '📅',
    deals: [
      {
        id: '4',
        name: 'Nike Air Max 90',
        brand: 'Nike',
        originalPrice: 120.00,
        dealPrice: 84.99,
        discount: 29,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        rating: 4.5,
        reviewCount: 1234,
        isPrime: true
      },
      {
        id: '5',
        name: 'Instant Pot Duo 7-in-1',
        brand: 'Instant Pot',
        originalPrice: 99.99,
        dealPrice: 69.99,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        rating: 4.6,
        reviewCount: 8901,
        isPrime: true
      }
    ]
  }
]

const renderStars = (rating: number) => {
  return '⭐'.repeat(Math.floor(rating))
}

const DealCard = ({ deal, showTimer = false }: { deal: Deal, showTimer?: boolean }) => (
  <div className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
    {/* Discount badge */}
    <div className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
      {deal.discount}% OFF
    </div>

    {/* Timer for lightning deals */}
    {showTimer && deal.timeLeft && (
      <div className="absolute right-2 top-2 z-10 rounded bg-amazon-orange px-2 py-1 text-xs font-bold text-white">
        <Clock className="mr-1 inline h-3 w-3" />
        {deal.timeLeft}
      </div>
    )}

    {/* Product Image */}
    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
      <Link href={`/product/${deal.name.toLowerCase().replace(/\s+/g, '-')}`}>
        <Image
          src={deal.image}
          alt={deal.name}
          width={300}
          height={300}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </Link>
    </div>

    {/* Product Info */}
    <div className="space-y-2">
      <div className="text-xs text-gray-500">{deal.brand}</div>
      
      <h3 className="font-medium text-gray-900 line-clamp-2">
        <Link href={`/product/${deal.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amazon-orange">
          {deal.name}
        </Link>
      </h3>

      {/* Rating */}
      <div className="flex items-center space-x-1 text-sm">
        <span className="text-yellow-400">{renderStars(deal.rating)}</span>
        <span className="text-gray-600">({deal.reviewCount.toLocaleString()})</span>
      </div>

      {/* Prices */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(deal.dealPrice)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(deal.originalPrice)}
          </span>
        </div>
        {deal.isPrime && (
          <div className="text-xs text-blue-600 font-bold">prime FREE One-Day</div>
        )}
      </div>

      {/* Claimed progress for lightning deals */}
      {deal.claimed && deal.totalAvailable && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{deal.claimed}% claimed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amazon-orange h-2 rounded-full transition-all duration-300" 
              style={{ width: `${deal.claimed}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <Button variant="amazon" size="sm" className="w-full mt-4">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  </div>
)

export default function DealsPage() {
  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-red-600 via-amazon-orange to-yellow-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Today&apos;s Best Deals
          </h1>
          <p className="mb-8 text-xl opacity-90 md:text-2xl">
            Save up to 70% on top brands and trending products
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="cart" size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Tag className="mr-2 h-4 w-4" />
              Browse All Deals
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Deal Categories */}
        {dealCategories.map((category) => (
          <section key={category.id} className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  <p className="text-gray-600">{category.subtitle}</p>
                </div>
              </div>
              <Link href={`/deals/${category.id}`} className="text-amazon-orange hover:underline">
                See all {category.title.toLowerCase()}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.deals.map((deal) => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  showTimer={category.id === 'lightning'} 
                />
              ))}
            </div>
          </section>
        ))}

        {/* Special Offers */}
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 text-center">Special Offers</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="mb-4 text-4xl">👑</div>
              <h3 className="mb-2 text-xl font-bold">Prime Member Exclusive</h3>
              <p className="mb-4 text-blue-100">Extra 10% off on select items</p>
              <Button variant="cart" size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                Shop Prime Deals
              </Button>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
              <div className="mb-4 text-4xl">🚚</div>
              <h3 className="mb-2 text-xl font-bold">Free Shipping</h3>
              <p className="mb-4 text-green-100">On orders over $35</p>
              <Button variant="cart" size="sm" className="bg-white text-green-600 hover:bg-gray-100">
                Shop Now
              </Button>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
              <div className="mb-4 text-4xl">🎁</div>
              <h3 className="mb-2 text-xl font-bold">Bundle & Save</h3>
              <p className="mb-4 text-purple-100">Buy 2 get 1 free on select items</p>
              <Button variant="cart" size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
                View Bundles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Never Miss a Deal</h2>
          <p className="mb-6 text-gray-600">
            Get notified about flash sales, exclusive offers, and new arrivals
          </p>
          <div className="mx-auto flex max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:border-amazon-orange focus:outline-none"
            />
            <Button variant="amazon" className="rounded-l-none">
              Subscribe
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Today\'s Deals - TFMshop',
  description: 'Discover amazing deals and save big on top brands. Lightning deals, daily offers, and exclusive discounts.',
}
