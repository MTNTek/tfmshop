'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Heart,
  ShoppingCart,
  Star,
  ArrowRight,
  RefreshCw,
  Target,
  Brain,
  Zap,
  Eye,
  User,
  Gift,
  Filter
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  inStock: boolean;
}

interface RecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  type: 'personalized' | 'trending' | 'similar' | 'collaborative' | 'seasonal' | 'ai-curated';
  icon: React.ReactNode;
  products: Product[];
  algorithm: string;
  confidence: number;
}

// Mock user behavior data
const mockUserProfile = {
  id: 'user123',
  preferences: ['Electronics', 'Fashion', 'Home & Garden'],
  recentlyViewed: ['iPhone 15 Pro', 'MacBook Pro', 'Sony Headphones'],
  purchaseHistory: ['iPad Pro', 'Apple Watch', 'AirPods'],
  priceRange: { min: 100, max: 2000 },
  favoritebrands: ['Apple', 'Sony', 'Samsung'],
  shoppingBehavior: {
    timeOfDay: 'evening',
    frequency: 'weekly',
    avgOrderValue: 456.78,
    devicePreference: 'mobile'
  }
};

const generateRecommendations = (): RecommendationSection[] => {
  const baseProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 1199.99,
      originalPrice: 1299.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
      rating: 4.8,
      reviews: 1247,
      category: 'Electronics',
      tags: ['smartphone', 'premium', 'camera', '5G'],
      inStock: true
    },
    {
      id: '2',
      name: 'MacBook Pro 14-inch M3',
      brand: 'Apple',
      price: 1999.99,
      originalPrice: 2199.99,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
      rating: 4.9,
      reviews: 892,
      category: 'Electronics',
      tags: ['laptop', 'professional', 'M3', 'creative'],
      inStock: true
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 349.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300',
      rating: 4.7,
      reviews: 2156,
      category: 'Electronics',
      tags: ['headphones', 'noise-canceling', 'wireless', 'premium'],
      inStock: true
    },
    {
      id: '4',
      name: 'Apple Watch Series 9',
      brand: 'Apple',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300',
      rating: 4.6,
      reviews: 1834,
      category: 'Electronics',
      tags: ['smartwatch', 'fitness', 'health', 'ios'],
      inStock: true
    },
    {
      id: '5',
      name: 'Samsung Galaxy Buds Pro',
      brand: 'Samsung',
      price: 199.99,
      originalPrice: 229.99,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300',
      rating: 4.4,
      reviews: 967,
      category: 'Electronics',
      tags: ['earbuds', 'wireless', 'anc', 'compact'],
      inStock: true
    },
    {
      id: '6',
      name: 'Tesla Model Y Accessories Kit',
      brand: 'Tesla',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300',
      rating: 4.5,
      reviews: 543,
      category: 'Automotive',
      tags: ['tesla', 'accessories', 'premium', 'tech'],
      inStock: true
    }
  ];

  return [
    {
      id: 'ai-personal',
      title: 'AI Curated Just for You',
      subtitle: 'Based on your preferences, behavior, and purchase history',
      type: 'ai-curated',
      icon: <Brain className="h-5 w-5 text-purple-600" />,
      products: baseProducts.slice(0, 4),
      algorithm: 'Deep Learning Neural Network',
      confidence: 94.2
    },
    {
      id: 'trending',
      title: 'Trending Right Now',
      subtitle: 'What others are buying this week',
      type: 'trending',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      products: baseProducts.slice(1, 5),
      algorithm: 'Real-time Trend Analysis',
      confidence: 87.6
    },
    {
      id: 'similar-users',
      title: 'Customers Like You Also Bought',
      subtitle: 'Collaborative filtering based on similar shopping patterns',
      type: 'collaborative',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      products: baseProducts.slice(2, 6),
      algorithm: 'Collaborative Filtering',
      confidence: 91.3
    },
    {
      id: 'recently-viewed',
      title: 'Since You Viewed iPhone 15 Pro',
      subtitle: 'Products that complement your recent browsing',
      type: 'similar',
      icon: <Eye className="h-5 w-5 text-orange-600" />,
      products: [baseProducts[1], baseProducts[3], baseProducts[4], baseProducts[0]],
      algorithm: 'Content-Based Filtering',
      confidence: 88.9
    },
    {
      id: 'seasonal',
      title: 'Summer Tech Essentials',
      subtitle: 'Perfect for the season ahead',
      type: 'seasonal',
      icon: <Sparkles className="h-5 w-5 text-yellow-600" />,
      products: [baseProducts[2], baseProducts[4], baseProducts[5], baseProducts[3]],
      algorithm: 'Seasonal Trend Analysis',
      confidence: 82.1
    },
    {
      id: 'personalized-deals',
      title: 'Exclusive Deals for You',
      subtitle: 'Personalized discounts based on your preferences',
      type: 'personalized',
      icon: <Gift className="h-5 w-5 text-red-600" />,
      products: baseProducts.filter(p => p.originalPrice).slice(0, 4),
      algorithm: 'Price Optimization ML',
      confidence: 95.7
    }
  ];
};

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high-confidence' | 'trending'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulate AI processing
    setTimeout(() => {
      setRecommendations(generateRecommendations());
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate AI re-processing
    setTimeout(() => {
      setRecommendations(generateRecommendations());
      setRefreshing(false);
    }, 2000);
  };

  const filteredRecommendations = recommendations.filter(section => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high-confidence') return section.confidence > 90;
    if (selectedFilter === 'trending') return section.type === 'trending' || section.type === 'seasonal';
    return true;
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const getTypeColor = (type: RecommendationSection['type']) => {
    switch (type) {
      case 'ai-curated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trending': return 'bg-green-100 text-green-800 border-green-200';
      case 'collaborative': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'similar': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'seasonal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'personalized': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is Personalizing Your Experience</h2>
          <p className="text-gray-600 mb-4">Analyzing your preferences and shopping behavior...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Zap className="h-4 w-4 animate-pulse" />
            <span>Processing with advanced machine learning</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by AI
                </span>
              </div>
              <p className="text-gray-600">Personalized product suggestions powered by advanced machine learning</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Recommendations</option>
                <option value="high-confidence">High Confidence (90%+)</option>
                <option value="trending">Trending & Seasonal</option>
              </select>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh AI</span>
              </Button>
            </div>
          </div>
        </div>

        {/* User Profile Insights */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your AI Shopping Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Preferred: {mockUserProfile.preferences.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Brands: {mockUserProfile.favoritebrands.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Shops: {mockUserProfile.shoppingBehavior.timeOfDay}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Avg: {formatPrice(mockUserProfile.shoppingBehavior.avgOrderValue)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">AI Match</div>
              <div className="text-lg">94.2%</div>
            </div>
          </div>
        </div>

        {/* Recommendation Sections */}
        <div className="space-y-8">
          {filteredRecommendations.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(section.type)}`}>
                      {section.algorithm}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{section.confidence}%</div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.products.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-purple-300">
                        <div className="aspect-square relative">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {product.originalPrice && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </div>
                          )}
                          <button className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h4>
                            <p className="text-xs text-gray-600">{product.brand}</p>
                          </div>
                          
                          <div className="flex items-center space-x-1 mb-2">
                            {renderStars(product.rating)}
                            <span className="text-xs text-gray-600">({product.reviews})</span>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* AI Insights */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href={`/category/${section.products[0]?.category.toLowerCase().replace(' ', '-')}`}>
                    <Button variant="outline" className="group">
                      <span>View More Recommendations</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Learning Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Brain className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Our AI Learns About You</h3>
              <p className="text-blue-700 mb-4">
                Our recommendation engine continuously learns from your browsing history, purchase patterns, ratings, and interactions 
                to provide increasingly personalized suggestions. The more you shop, the smarter it gets!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Viewing patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <span>Purchase history</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span>Ratings & reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
