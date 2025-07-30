'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, StarHalf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: string
  comparePrice?: string
  image: string
  rating?: number
  reviewCount?: number
  brand?: string
  isPrime?: boolean
  isBestSeller?: boolean
  className?: string
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  rating = 0,
  reviewCount = 0,
  brand,
  isPrime = false,
  isBestSeller = false,
  className = ''
}: ProductCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {isBestSeller && (
          <span className="rounded bg-amazon-orange px-2 py-1 text-xs font-semibold text-white">
            #1 Best Seller
          </span>
        )}
        {isPrime && (
          <span className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            Prime
          </span>
        )}
      </div>

      <Link href={`/product/${slug}`} className="block">
        {/* Product Image */}
        <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Brand */}
          {brand && (
            <p className="text-xs text-gray-600 uppercase tracking-wider">{brand}</p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-amazon-orange">
            {name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="text-xs text-blue-600 hover:underline">
                {reviewCount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(price)}
            </span>
            {comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          {/* Prime delivery */}
          {isPrime && (
            <p className="text-xs text-gray-600">
              FREE delivery <strong>Tomorrow</strong>
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="mt-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button 
          variant="cart" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.preventDefault()
            // Handle add to cart
            console.log('Add to cart:', id)
          }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
