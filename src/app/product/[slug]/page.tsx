import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Mock product data - in real app this would come from database
const products = {
  'iphone-15-pro': {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: '999.00',
    comparePrice: '1099.00',
    description: 'The iPhone 15 Pro brings advanced titanium design, the powerful A17 Pro chip, and a revolutionary camera system for the ultimate smartphone experience.',
    features: [
      'A17 Pro chip with 6-core GPU for incredible performance',
      'Pro camera system with 48MP Main camera',
      'Titanium design for incredible durability',
      'USB-C connectivity',
      'Dynamic Island for notifications and Live Activities'
    ],
    specifications: {
      'Display': '6.1-inch Super Retina XDR display',
      'Chip': 'A17 Pro chip',
      'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
      'Storage': '128GB, 256GB, 512GB, 1TB',
      'Colors': 'Natural Titanium, Blue Titanium, White Titanium, Black Titanium'
    },
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
      'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600'
    ],
    rating: 4.5,
    reviewCount: 1247,
    inStock: true,
    isPrime: true,
    category: 'Electronics'
  },
  'nike-air-max-270': {
    id: '2',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    price: '150.00',
    comparePrice: undefined,
    description: 'The Nike Air Max 270 delivers unrivaled all-day comfort with the largest Max Air unit yet.',
    features: [
      'Max Air unit for superior cushioning',
      'Engineered mesh upper for breathability',
      'Rubber outsole for durability and traction',
      'Pull tabs for easy on and off'
    ],
    specifications: {
      'Upper Material': 'Engineered mesh and synthetic',
      'Midsole': 'Foam with Max Air unit',
      'Outsole': 'Rubber',
      'Sizes': '6-15',
      'Colors': 'Multiple colorways available'
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'
    ],
    rating: 4.3,
    reviewCount: 892,
    inStock: true,
    isPrime: true,
    category: 'Fashion'
  }
}

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products[params.slug as keyof typeof products]

  if (!product) {
    notFound()
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 2}`}
                      width={150}
                      height={150}
                      className="h-full w-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand and Title */}
            <div>
              <p className="text-sm text-gray-600">{product.brand}</p>
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {product.rating}
              </span>
              <span className="text-sm text-gray-500">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(parseFloat(product.price))}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(parseFloat(product.comparePrice))}
                  </span>
                )}
              </div>
              {product.isPrime && (
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">prime</span>
                  <span className="text-sm text-gray-600">FREE One-Day Delivery</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amazon-orange"></span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add to Cart Section */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                {product.inStock ? (
                  <p className="text-green-600 font-medium">✓ In Stock</p>
                ) : (
                  <p className="text-red-600 font-medium">Out of Stock</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="amazon" 
                    size="lg" 
                    className="w-full"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="cart" 
                    size="lg" 
                    className="w-full"
                    disabled={!product.inStock}
                  >
                    Buy Now
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Technical Specifications</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-200 pb-3">
                <dt className="w-1/3 font-medium text-gray-900">{key}:</dt>
                <dd className="w-2/3 text-gray-700">{value}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = products[params.slug as keyof typeof products]

  if (!product) {
    return {
      title: 'Product Not Found - TFMshop',
    }
  }

  return {
    title: `${product.name} - ${product.brand} | TFMshop`,
    description: product.description,
  }
}
