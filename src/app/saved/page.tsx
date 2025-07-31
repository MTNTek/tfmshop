'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Star, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock saved items data
const initialSavedItems = [
  {
    id: '1',
    name: 'Samsung 65" 4K Smart TV',
    brand: 'Samsung',
    price: 899.99,
    originalPrice: 1199.99,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200',
    rating: 4.6,
    reviews: 1453,
    inStock: true,
    dateAdded: '2024-01-15',
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'Apple MacBook Pro 14"',
    brand: 'Apple',
    price: 1999.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
    rating: 4.8,
    reviews: 892,
    inStock: true,
    dateAdded: '2024-01-12',
    category: 'Electronics'
  },
  {
    id: '3',
    name: 'Adidas Running Shoes',
    brand: 'Adidas',
    price: 120.00,
    originalPrice: 150.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
    rating: 4.4,
    reviews: 567,
    inStock: false,
    dateAdded: '2024-01-10',
    category: 'Fashion'
  },
  {
    id: '4',
    name: 'Instant Pot Duo 7-in-1',
    brand: 'Instant Pot',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
    rating: 4.7,
    reviews: 2341,
    inStock: true,
    dateAdded: '2024-01-08',
    category: 'Home & Kitchen'
  }
];

export default function SavedItemsPage() {
  const [savedItems, setSavedItems] = useState(initialSavedItems);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(savedItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'All' 
    ? savedItems 
    : savedItems.filter(item => item.category === selectedCategory);

  const removeFromSaved = (id: string) => {
    setSavedItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (id: string) => {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', id);
  };

  const moveAllToCart = () => {
    // TODO: Implement move all to cart functionality
    console.log('Moving all items to cart');
  };

  if (savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Heart className="mx-auto h-24 w-24 text-gray-300" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">No saved items</h1>
          <p className="mt-2 text-gray-600">Items you save for later will appear here</p>
          <Link href="/">
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
          <p className="text-gray-600 mt-2">
            {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === category
                        ? 'bg-orange-100 text-orange-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={moveAllToCart}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={filteredItems.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move All to Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Saved Items Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFromSaved(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </button>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                      <Link href={`/product/${item.id}`} className="hover:text-orange-600">
                        {item.name}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">{item.brand}</p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(item.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {item.rating} ({item.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      {item.originalPrice && (
                        <div className="text-sm text-green-600 font-medium">
                          Save {formatPrice(item.originalPrice - item.price)} 
                          ({Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => addToCart(item.id)}
                        disabled={!item.inStock}
                        className={`w-full ${
                          item.inStock
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => removeFromSaved(item.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>

                    {/* Date saved */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Saved on {new Date(item.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && selectedCategory !== 'All' && (
              <div className="text-center py-12">
                <p className="text-gray-500">No items found in {selectedCategory} category</p>
                <Button
                  onClick={() => setSelectedCategory('All')}
                  variant="outline"
                  className="mt-4"
                >
                  View All Items
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  Sample Product {item}
                </h4>
                <p className="text-sm font-bold text-orange-600">$99.99</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
