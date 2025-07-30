import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ui/product-card'

// Sample featured products (in a real app, this would come from the database)
const featuredProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    price: '999.00',
    comparePrice: '1099.00',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.5,
    reviewCount: 1247,
    brand: 'Apple',
    isPrime: true,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    slug: 'nike-air-max-270',
    price: '150.00',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    rating: 4.3,
    reviewCount: 892,
    brand: 'Nike',
    isPrime: true,
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    slug: 'macbook-pro-14',
    price: '1999.00',
    comparePrice: '2199.00',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    rating: 4.8,
    reviewCount: 567,
    brand: 'Apple',
    isPrime: true,
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    price: '399.00',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    rating: 4.6,
    reviewCount: 1834,
    brand: 'Sony',
    isPrime: true,
  }
]

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
  },
  {
    name: 'Fashion',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  },
  {
    name: 'Books',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  }
]

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Banner */}
      <section className="relative h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200"
          alt="TFMshop Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              Shop, Smile, Save More
            </h1>
            <p className="mb-8 text-xl opacity-90 md:text-2xl">
              Discover millions of products with fast, free delivery
            </p>
            <Button variant="amazon" size="lg" className="px-12">
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-2xl font-bold">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-square">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-lg font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Today&apos;s Deals</h2>
            <Link href="/deals" className="text-amazon-orange hover:underline">
              See all deals
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Choose TFMshop?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amazon-orange">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fast Delivery</h3>
              <p className="text-gray-600">FREE One-Day Delivery on millions of items</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amazon-orange">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quality Guaranteed</h3>
              <p className="text-gray-600">Easy returns and customer service that puts you first</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amazon-orange">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Low Prices</h3>
              <p className="text-gray-600">Great prices, with free shipping on orders $25+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prime Benefits */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Try TFMshop Prime</h2>
          <p className="mb-8 text-xl">
            FREE One-Day Delivery, exclusive deals, and unlimited streaming
          </p>
          <Button variant="cart" size="lg" className="px-12">
            Start your FREE trial
          </Button>
        </div>
      </section>
    </div>
  )
}
