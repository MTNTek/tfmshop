'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, Share2, MapPin, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { formatPrice } from '@/lib/utils';

const sampleProduct = {
  id: 'iphone-15-pro',
  name: 'iPhone 15 Pro - 128GB - Natural Titanium',
  price: 999.99,
  originalPrice: 1099.99,
  image: 'https://images.unsplash.com/photo-1592910108576-86a3eb2a816d?w=500',
  inStock: true,
  isPrime: true,
  seller: 'Apple Official Store',
  rating: 4.8,
  reviewCount: 2847,
  description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and an advanced camera system with 3x optical zoom.',
  features: [
    'A17 Pro chip with 6-core GPU',
    'Pro camera system with 48MP main camera',
    'Up to 23 hours video playback',
    'Titanium design with Ceramic Shield front',
    'USB-C connector',
    'Face ID for secure authentication'
  ]
};

export default function SampleProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = [
    'https://images.unsplash.com/photo-1592910108576-86a3eb2a816d?w=500',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500',
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={images[selectedImage]}
                alt={sampleProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImage === index ? 'border-tfm-navy' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Product view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sampleProduct.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(sampleProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {sampleProduct.rating} ({sampleProduct.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(sampleProduct.price)}
                </span>
                {sampleProduct.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(sampleProduct.originalPrice)}
                  </span>
                )}
              </div>
              {sampleProduct.originalPrice && (
                <div className="text-sm text-green-600">
                  You save {formatPrice(sampleProduct.originalPrice - sampleProduct.price)} 
                  ({Math.round(((sampleProduct.originalPrice - sampleProduct.price) / sampleProduct.originalPrice) * 100)}% off)
                </div>
              )}
            </div>

            {/* Prime Benefits */}
            {sampleProduct.isPrime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Prime Benefits</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• FREE One-Day Delivery</li>
                  <li>• FREE Returns within 30 days</li>
                  <li>• Extended warranty options</li>
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="text-green-600 font-medium">
              ✓ In Stock - Ready to ship
            </div>

            {/* Add to Cart Section */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded px-3 py-1"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <AddToCartButton
                    product={sampleProduct}
                    size="lg"
                    className="w-full"
                    onAddToCart={() => console.log('Added to cart!')}
                  />
                  
                  <Button variant="outline" size="lg" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Wishlist
                  </Button>

                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Shield className="mr-2 h-4 w-4" />
                      Compare
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {sampleProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                Sold by: <span className="font-medium text-gray-900">{sampleProduct.seller}</span>
              </div>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  30-day returns
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Warranty included
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">🛒 Cart Functionality Demo</h2>
          <div className="text-blue-800 space-y-2">
            <p>This page demonstrates the new shopping cart functionality:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Click "Add to Cart" to add this product to your cart</li>
              <li>The cart icon in the header will show the item count</li>
              <li>Click the cart icon to open the sidebar with cart details</li>
              <li>Manage quantities and remove items from the sidebar</li>
              <li>Cart state persists in localStorage across page refreshes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
