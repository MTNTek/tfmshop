'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Zap,
  Shield,
  Wifi,
  Battery,
  Smartphone,
  Monitor,
  Headphones,
  Camera,
  Gamepad2,
  Laptop,
  Watch,
  Home,
  Car,
  Lightbulb,
  Thermometer,
  Lock,
  Speaker,
  Router,
  HardDrive,
  MemoryStick,
  MousePointer,
  Keyboard,
  Printer,
  Scan,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Award,
  Sparkles,
  Globe,
  Target,
  BarChart3
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface TechProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  specs: TechSpec[];
  features: string[];
  compatibility: string[];
  inStock: boolean;
  isNew: boolean;
  isBestseller: boolean;
  releaseDate?: string;
  techScore: number; // AI-calculated tech advancement score
}

interface TechSpec {
  name: string;
  value: string;
  icon?: React.ReactNode;
}

interface TechCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  productCount: number;
  description: string;
  trending: boolean;
}

// Mock tech categories
const techCategories: TechCategory[] = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    icon: <Smartphone className="h-6 w-6" />,
    productCount: 156,
    description: 'Latest flagship and budget smartphones',
    trending: true
  },
  {
    id: 'laptops',
    name: 'Laptops & Computers',
    icon: <Laptop className="h-6 w-6" />,
    productCount: 89,
    description: 'Gaming, business, and ultrabooks',
    trending: false
  },
  {
    id: 'audio',
    name: 'Audio & Headphones',
    icon: <Headphones className="h-6 w-6" />,
    productCount: 124,
    description: 'Wireless, noise-canceling, studio',
    trending: true
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: <Gamepad2 className="h-6 w-6" />,
    productCount: 78,
    description: 'Consoles, peripherals, accessories',
    trending: true
  },
  {
    id: 'wearables',
    name: 'Wearables',
    icon: <Watch className="h-6 w-6" />,
    productCount: 45,
    description: 'Smartwatches, fitness trackers',
    trending: false
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    icon: <Home className="h-6 w-6" />,
    productCount: 167,
    description: 'IoT devices, automation, security',
    trending: true
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: <Zap className="h-6 w-6" />,
    productCount: 234,
    description: 'Chargers, cases, cables, stands',
    trending: false
  },
  {
    id: 'automotive',
    name: 'Automotive Tech',
    icon: <Car className="h-6 w-6" />,
    productCount: 67,
    description: 'Car tech, dashcams, GPS',
    trending: false
  }
];

// Mock tech products
const mockTechProducts: TechProduct[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'smartphones',
    subcategory: 'flagship',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.8,
    reviews: 2847,
    description: 'The most advanced iPhone yet with titanium design, A17 Pro chip, and Action Button',
    specs: [
      { name: 'Processor', value: 'A17 Pro Bionic', icon: <Cpu className="h-4 w-4" /> },
      { name: 'Display', value: '6.7" Super Retina XDR', icon: <Monitor className="h-4 w-4" /> },
      { name: 'Storage', value: '256GB', icon: <HardDrive className="h-4 w-4" /> },
      { name: 'Camera', value: '48MP Pro Camera System', icon: <Camera className="h-4 w-4" /> },
      { name: 'Battery', value: 'Up to 29h video', icon: <Battery className="h-4 w-4" /> }
    ],
    features: [
      'Titanium Design',
      'Action Button',
      'USB-C',
      'Dynamic Island',
      'Face ID',
      '5G Connectivity',
      'MagSafe Compatible',
      'Water Resistant (IP68)'
    ],
    compatibility: ['iOS 17', 'MagSafe', 'Qi Wireless Charging', 'Lightning to USB-C'],
    inStock: true,
    isNew: true,
    isBestseller: true,
    releaseDate: '2023-09-22',
    techScore: 96
  },
  {
    id: '2',
    name: 'MacBook Pro 14" M3 Max',
    brand: 'Apple',
    category: 'laptops',
    subcategory: 'professional',
    price: 3199.99,
    originalPrice: 3499.99,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    rating: 4.9,
    reviews: 1456,
    description: 'Supercharged for pros with M3 Max chip, featuring breakthrough performance and battery life',
    specs: [
      { name: 'Processor', value: 'Apple M3 Max', icon: <Cpu className="h-4 w-4" /> },
      { name: 'Memory', value: '36GB Unified Memory', icon: <MemoryStick className="h-4 w-4" /> },
      { name: 'Storage', value: '1TB SSD', icon: <HardDrive className="h-4 w-4" /> },
      { name: 'Display', value: '14.2" Liquid Retina XDR', icon: <Monitor className="h-4 w-4" /> },
      { name: 'Graphics', value: '40-core GPU', icon: <Cpu className="h-4 w-4" /> }
    ],
    features: [
      'M3 Max Chip',
      'Liquid Retina XDR Display',
      'ProMotion Technology',
      '1080p FaceTime HD Camera',
      'Six-speaker Sound System',
      'MagSafe 3',
      'Three Thunderbolt 4 Ports',
      '22-hour Battery Life'
    ],
    compatibility: ['macOS Sonoma', 'Thunderbolt 4', 'USB4', 'HDMI'],
    inStock: true,
    isNew: true,
    isBestseller: false,
    releaseDate: '2023-11-07',
    techScore: 98
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'audio',
    subcategory: 'headphones',
    price: 349.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    rating: 4.7,
    reviews: 3245,
    description: 'Industry-leading noise canceling with premium sound quality and comfort',
    specs: [
      { name: 'Driver', value: '30mm Dynamic', icon: <Speaker className="h-4 w-4" /> },
      { name: 'Battery', value: '30h with ANC', icon: <Battery className="h-4 w-4" /> },
      { name: 'Connectivity', value: 'Bluetooth 5.2', icon: <Wifi className="h-4 w-4" /> },
      { name: 'Charging', value: 'USB-C Fast Charge', icon: <Zap className="h-4 w-4" /> },
      { name: 'Weight', value: '249g', icon: <Award className="h-4 w-4" /> }
    ],
    features: [
      'Industry-Leading Noise Canceling',
      'V1 Processor',
      'Adaptive Sound Control',
      'Speak-to-Chat',
      'Quick Attention Mode',
      'Multipoint Connection',
      'LDAC & 360 Audio',
      'Comfortable Design'
    ],
    compatibility: ['iOS', 'Android', 'Windows', 'Mac', 'Sony Headphones App'],
    inStock: true,
    isNew: false,
    isBestseller: true,
    techScore: 92
  },
  {
    id: '4',
    name: 'PS5 DualSense Edge',
    brand: 'PlayStation',
    category: 'gaming',
    subcategory: 'controllers',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    rating: 4.6,
    reviews: 892,
    description: 'Ultra-customizable wireless controller with professional-grade features',
    specs: [
      { name: 'Connectivity', value: 'Wireless/USB-C', icon: <Wifi className="h-4 w-4" /> },
      { name: 'Battery', value: 'Built-in rechargeable', icon: <Battery className="h-4 w-4" /> },
      { name: 'Features', value: 'Haptic Feedback', icon: <Gamepad2 className="h-4 w-4" /> },
      { name: 'Customization', value: 'Remappable buttons', icon: <Target className="h-4 w-4" /> }
    ],
    features: [
      'Modular Design',
      'Replaceable Stick Modules',
      'Back Buttons',
      'Trigger Stops',
      'Carrying Case Included',
      'Hair Triggers',
      'Profile Switching',
      'Haptic Feedback'
    ],
    compatibility: ['PS5', 'PC', 'Mobile (via Bluetooth)'],
    inStock: true,
    isNew: true,
    isBestseller: false,
    techScore: 89
  },
  {
    id: '5',
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    category: 'wearables',
    subcategory: 'smartwatch',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
    rating: 4.8,
    reviews: 1567,
    description: 'The most rugged and capable Apple Watch designed for endurance athletes and outdoor adventurers',
    specs: [
      { name: 'Display', value: '49mm Retina', icon: <Monitor className="h-4 w-4" /> },
      { name: 'Processor', value: 'S9 SiP', icon: <Cpu className="h-4 w-4" /> },
      { name: 'Battery', value: 'Up to 72h Low Power', icon: <Battery className="h-4 w-4" /> },
      { name: 'Durability', value: 'Titanium Case', icon: <Shield className="h-4 w-4" /> }
    ],
    features: [
      'Titanium Construction',
      'Action Button',
      'Siren (86dB)',
      'Precision Finding',
      'Cellular Connectivity',
      'GPS Dual-Frequency',
      'Water Resistant 100m',
      'Temperature Sensor'
    ],
    compatibility: ['iPhone', 'watchOS 10', 'Apple Fitness+', 'Apple Pay'],
    inStock: true,
    isNew: true,
    isBestseller: false,
    techScore: 94
  },
  {
    id: '6',
    name: 'Tesla Smart Home Gateway',
    brand: 'Tesla',
    category: 'smart-home',
    subcategory: 'energy',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    rating: 4.5,
    reviews: 456,
    description: 'Complete home energy management with solar integration and backup power',
    specs: [
      { name: 'Power', value: '7.6kW Continuous', icon: <Zap className="h-4 w-4" /> },
      { name: 'Connectivity', value: 'Wi-Fi + Cellular', icon: <Wifi className="h-4 w-4" /> },
      { name: 'Monitoring', value: 'Real-time Energy', icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'Integration', value: 'Tesla App', icon: <Smartphone className="h-4 w-4" /> }
    ],
    features: [
      'Solar Integration',
      'Backup Power',
      'Time-Based Control',
      'Storm Watch',
      'Mobile App Control',
      'Over-the-Air Updates',
      'Load Management',
      'Grid Independence'
    ],
    compatibility: ['Tesla Solar', 'Tesla Powerwall', 'Tesla App', 'Third-party Solar'],
    inStock: false,
    isNew: true,
    isBestseller: false,
    techScore: 91
  }
];

export default function TechHubPage() {
  const [products, setProducts] = useState(mockTechProducts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'tech-score'>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'tech-score':
        return b.techScore - a.techScore;
      case 'featured':
      default:
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
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

  const getTechScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 90) return 'text-blue-600 bg-blue-100';
    if (score >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Cpu className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">Tech Hub</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered
              </span>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Discover cutting-edge technology with intelligent recommendations and detailed tech specs
            </p>
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product, brand, or technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <Button size="lg" variant="secondary">
                <Filter className="h-5 w-5 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Tech Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {techCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {category.trending && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Hot
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-2 rounded-lg ${
                    selectedCategory === category.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {category.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.productCount} items</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="tech-score">Tech Score</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{filteredProducts.length} products found</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      BESTSELLER
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                
                {/* Tech Score */}
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getTechScoreColor(product.techScore)}`}>
                    Tech Score: {product.techScore}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm">
                    <Eye className="h-4 w-4 text-gray-600 hover:text-blue-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-600">{product.brand}</p>
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-600">({product.reviews})</span>
                </div>

                {/* Key Specs */}
                <div className="mb-3">
                  {product.specs.slice(0, 2).map((spec) => (
                    <div key={spec.name} className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                      {spec.icon}
                      <span className="font-medium">{spec.name}:</span>
                      <span>{spec.value}</span>
                    </div>
                  ))}
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

                {/* Features Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.features.slice(0, 2).map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 2 && (
                    <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{product.features.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {product.inStock ? 'Add to Cart' : 'Notify Me'}
                  </Button>
                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Insights */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <div className="text-center mb-8">
            <Zap className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-4">AI-Powered Tech Insights</h2>
            <p className="text-lg opacity-90">
              Our AI analyzes thousands of tech specs, reviews, and innovations to give you the smartest recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <BarChart3 className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Performance Analysis</h3>
              <p className="text-sm opacity-90">Real-world benchmarks and performance metrics</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <Globe className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Compatibility Check</h3>
              <p className="text-sm opacity-90">Ensure perfect compatibility with your setup</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <Award className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="font-semibold mb-2">Future-Proof Rating</h3>
              <p className="text-sm opacity-90">How long your tech will stay relevant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
