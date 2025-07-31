'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, Plus, Star, ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock products for comparison
const sampleProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999.99,
    originalPrice: 1099.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
    rating: 4.8,
    reviews: 2456,
    inStock: true,
    features: {
      'Screen Size': '6.1 inches',
      'Storage': '128GB',
      'Camera': '48MP Pro camera system',
      'Battery Life': 'Up to 23 hours video',
      'Processor': 'A17 Pro chip',
      'Operating System': 'iOS 17',
      'Weight': '187g',
      'Colors': 'Natural Titanium, Blue Titanium, White Titanium, Black Titanium',
      'Water Resistance': 'IP68',
      'Wireless Charging': 'Yes'
    }
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300',
    rating: 4.6,
    reviews: 1823,
    inStock: true,
    features: {
      'Screen Size': '6.8 inches',
      'Storage': '256GB',
      'Camera': '200MP main camera',
      'Battery Life': 'Up to 22 hours video',
      'Processor': 'Snapdragon 8 Gen 3',
      'Operating System': 'Android 14',
      'Weight': '233g',
      'Colors': 'Titanium Black, Titanium Gray, Titanium Violet, Titanium Yellow',
      'Water Resistance': 'IP68',
      'Wireless Charging': 'Yes'
    }
  },
  {
    id: '3',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    price: 899.99,
    originalPrice: 999.99,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300',
    rating: 4.5,
    reviews: 1245,
    inStock: true,
    features: {
      'Screen Size': '6.7 inches',
      'Storage': '128GB',
      'Camera': '50MP main camera',
      'Battery Life': 'Up to 24 hours',
      'Processor': 'Google Tensor G3',
      'Operating System': 'Android 14',
      'Weight': '210g',
      'Colors': 'Obsidian, Porcelain, Bay',
      'Water Resistance': 'IP68',
      'Wireless Charging': 'Yes'
    }
  }
];

export default function ComparePage() {
  const [compareProducts, setCompareProducts] = useState(sampleProducts.slice(0, 2));
  const [showAddProduct, setShowAddProduct] = useState(false);

  const removeProduct = (id: string) => {
    setCompareProducts(products => products.filter(p => p.id !== id));
  };

  const addProduct = (product: typeof sampleProducts[0]) => {
    if (compareProducts.length < 4) {
      setCompareProducts(products => [...products, product]);
      setShowAddProduct(false);
    }
  };

  const availableProducts = sampleProducts.filter(
    product => !compareProducts.some(cp => cp.id === product.id)
  );

  // Get all unique features
  const allFeatures = [...new Set(
    compareProducts.flatMap(product => Object.keys(product.features))
  )];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Comparison</h1>
          <p className="text-gray-600 mt-2">
            Compare up to 4 products side by side
          </p>
        </div>

        {compareProducts.length === 0 ? (
          <div className="text-center py-16">
            <Plus className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">No products to compare</h2>
            <p className="mt-2 text-gray-600">Add products to start comparing</p>
            <Button
              onClick={() => setShowAddProduct(true)}
              className="mt-6 bg-orange-500 hover:bg-orange-600"
            >
              Add Products
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Product Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b">
              {compareProducts.map((product) => (
                <div key={product.id} className="p-6 border-r border-gray-200 last:border-r-0">
                  <div className="relative">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-green-600 font-medium">
                          Save {formatPrice(product.originalPrice - product.price)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Save for Later
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Product Card */}
              {compareProducts.length < 4 && (
                <div className="p-6 border-r border-gray-200 last:border-r-0">
                  <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <Button
                      onClick={() => setShowAddProduct(true)}
                      variant="outline"
                      className="flex-col h-auto py-4"
                    >
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <span>Add Product</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Features
                    </th>
                    {compareProducts.map((product) => (
                      <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allFeatures.map((feature, index) => (
                    <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feature}
                      </td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(product.features as any)[feature] || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Product to Compare</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:border-orange-300">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-lg font-bold text-orange-600 mb-3">
                      {formatPrice(product.price)}
                    </p>
                    <Button
                      onClick={() => addProduct(product)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Add to Compare
                    </Button>
                  </div>
                ))}
              </div>
              
              {availableProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No more products available to compare
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
