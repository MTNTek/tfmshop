'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  User,
  Brain,
  TrendingUp,
  ShoppingBag,
  Heart,
  Eye,
  Clock,
  Target,
  Zap,
  Calendar,
  Star,
  Gift,
  Crown,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Bookmark,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Bell,
  Settings,
  Download,
  Share2,
  Filter,
  Search,
  RefreshCw,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Percent,
  DollarSign,
  ShoppingCart,
  Timer
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PersonalizedInsight {
  id: string;
  type: 'spending' | 'behavior' | 'preference' | 'recommendation' | 'trend';
  title: string;
  description: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ShoppingPattern {
  category: string;
  frequency: number;
  avgSpending: number;
  lastPurchase: Date;
  trend: 'up' | 'down' | 'stable';
  seasonality: string[];
}

interface PredictiveRecommendation {
  id: string;
  type: 'replenishment' | 'seasonal' | 'trend' | 'gift' | 'upgrade';
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    confidence: number;
  };
  reason: string;
  urgency: 'high' | 'medium' | 'low';
  savings?: number;
}

interface PersonalizedDeal {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
  products: Array<{
    id: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    image: string;
  }>;
  reason: string;
  claimed: boolean;
}

// Mock user data
const mockUser = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812-icon?w=200',
  tier: 'Gold',
  joinDate: new Date('2023-06-15'),
  totalSpent: 4567.89,
  totalOrders: 47,
  avgOrderValue: 97.18,
  favoriteCategories: ['Electronics', 'Fashion', 'Home & Garden'],
  shoppingScore: 8.7,
  sustainabilityScore: 7.2
};

const personalizedInsights: PersonalizedInsight[] = [
  {
    id: '1',
    type: 'spending',
    title: 'Monthly Spending Trend',
    description: 'Your spending has increased 23% this month compared to last month',
    value: '+23%',
    change: 23,
    icon: <TrendingUp className="h-5 w-5" />,
    actionable: true,
    priority: 'medium'
  },
  {
    id: '2',
    type: 'behavior',
    title: 'Peak Shopping Time',
    description: 'You shop most actively on Sunday evenings between 7-9 PM',
    value: 'Sunday 7-9 PM',
    icon: <Clock className="h-5 w-5" />,
    actionable: false,
    priority: 'low'
  },
  {
    id: '3',
    type: 'preference',
    title: 'Favorite Brand Shift',
    description: 'You\'ve been exploring more sustainable brands lately',
    value: 'Eco-friendly focus',
    icon: <Sparkles className="h-5 w-5" />,
    actionable: true,
    priority: 'high'
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Predicted Next Purchase',
    description: 'Based on your patterns, you\'ll likely buy headphones in the next 2 weeks',
    value: '89% confidence',
    icon: <Brain className="h-5 w-5" />,
    actionable: true,
    priority: 'high'
  },
  {
    id: '5',
    type: 'trend',
    title: 'Category Growth',
    description: 'Your electronics purchases have grown 45% this quarter',
    value: '+45%',
    change: 45,
    icon: <BarChart3 className="h-5 w-5" />,
    actionable: false,
    priority: 'medium'
  }
];

const shoppingPatterns: ShoppingPattern[] = [
  {
    category: 'Electronics',
    frequency: 2.3,
    avgSpending: 234.56,
    lastPurchase: new Date('2024-12-20'),
    trend: 'up',
    seasonality: ['Black Friday', 'Back to School']
  },
  {
    category: 'Fashion',
    frequency: 4.1,
    avgSpending: 89.99,
    lastPurchase: new Date('2024-12-28'),
    trend: 'stable',
    seasonality: ['Spring', 'Fall', 'Holiday']
  },
  {
    category: 'Home & Garden',
    frequency: 1.8,
    avgSpending: 156.78,
    lastPurchase: new Date('2024-12-15'),
    trend: 'down',
    seasonality: ['Spring', 'Summer']
  }
];

const predictiveRecommendations: PredictiveRecommendation[] = [
  {
    id: '1',
    type: 'replenishment',
    product: {
      id: '1',
      name: 'Coffee Beans - Premium Blend',
      brand: 'RoastCo',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
      confidence: 94
    },
    reason: 'You usually reorder coffee every 3 weeks. Last order was 18 days ago.',
    urgency: 'high'
  },
  {
    id: '2',
    type: 'seasonal',
    product: {
      id: '2',
      name: 'Winter Jacket - Insulated',
      brand: 'WarmGear',
      price: 159.99,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200',
      confidence: 87
    },
    reason: 'Winter season approaching. You bought similar items last year.',
    urgency: 'medium',
    savings: 30
  },
  {
    id: '3',
    type: 'trend',
    product: {
      id: '3',
      name: 'Wireless Earbuds Pro',
      brand: 'AudioTech',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200',
      confidence: 82
    },
    reason: 'Trending in your interest areas. Similar to your recent headphone searches.',
    urgency: 'low'
  }
];

const personalizedDeals: PersonalizedDeal[] = [
  {
    id: '1',
    title: 'Your Electronics Bundle',
    description: 'Curated based on your Apple ecosystem preferences',
    discount: 25,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    products: [
      {
        id: '1',
        name: 'MacBook Air M2',
        originalPrice: 1199.99,
        salePrice: 899.99,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100'
      },
      {
        id: '2',
        name: 'AirPods Pro',
        originalPrice: 249.99,
        salePrice: 187.49,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100'
      }
    ],
    reason: 'Based on your Apple purchases and premium audio interest',
    claimed: false
  },
  {
    id: '2',
    title: 'Sustainable Fashion Selection',
    description: 'Eco-friendly brands you\'ll love',
    discount: 20,
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    products: [
      {
        id: '3',
        name: 'Organic Cotton T-Shirt',
        originalPrice: 45.00,
        salePrice: 36.00,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'
      }
    ],
    reason: 'You\'ve shown increased interest in sustainable products',
    claimed: false
  }
];

export default function PersonalizedDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'predictions' | 'deals'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  const getInsightsByPriority = (priority: string) => {
    return personalizedInsights.filter(insight => insight.priority === priority);
  };

  const getTimeframeDays = () => {
    switch (selectedTimeframe) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  width={60}
                  height={60}
                  className="rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {mockUser.name}!</h1>
                <p className="text-gray-600">Your personalized shopping experience powered by AI</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    {mockUser.tier} Member
                  </span>
                  <span className="text-sm text-gray-600">Shopping Score: {mockUser.shoppingScore}/10</span>
                  <span className="text-sm text-gray-600">Sustainability: {mockUser.sustainabilityScore}/10</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(mockUser.totalSpent)}</p>
                <p className="text-xs text-green-600 mt-1">↗ 23% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockUser.totalOrders}</p>
                <p className="text-xs text-blue-600 mt-1">5 orders this month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(mockUser.avgOrderValue)}</p>
                <p className="text-xs text-green-600 mt-1">↗ 12% improvement</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((Date.now() - mockUser.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}m
                </p>
                <p className="text-xs text-gray-600 mt-1">Loyal customer</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
                { id: 'insights', label: 'AI Insights', icon: <Brain className="h-4 w-4" /> },
                { id: 'predictions', label: 'Predictions', icon: <Target className="h-4 w-4" /> },
                { id: 'deals', label: 'Personal Deals', icon: <Gift className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shopping Patterns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Shopping Patterns</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {showAdvancedAnalytics ? 'Hide' : 'Show'} Analytics
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {shoppingPatterns.map((pattern, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{pattern.category}</h4>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatPrice(pattern.avgSpending)}</p>
                          <p className="text-xs text-gray-600">avg per order</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Frequency</p>
                          <p className="font-medium">{pattern.frequency}x/month</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Purchase</p>
                          <p className="font-medium">{formatTimeAgo(pattern.lastPurchase)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Peak Seasons</p>
                          <p className="font-medium">{pattern.seasonality.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>

                      {showAdvancedAnalytics && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-gray-600 mb-1">Purchase Prediction</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(pattern.frequency * 10, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Seasonality Match</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: '75%' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Purchased iPhone 15 Pro', time: '2 hours ago', icon: <ShoppingCart className="h-4 w-4 text-green-600" /> },
                    { action: 'Added MacBook to wishlist', time: '1 day ago', icon: <Heart className="h-4 w-4 text-red-600" /> },
                    { action: 'Viewed wireless headphones', time: '2 days ago', icon: <Eye className="h-4 w-4 text-blue-600" /> },
                    { action: 'Left review for coffee maker', time: '3 days ago', icon: <Star className="h-4 w-4 text-yellow-600" /> },
                    { action: 'Claimed loyalty reward', time: '5 days ago', icon: <Gift className="h-4 w-4 text-purple-600" /> }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Score Card */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="h-8 w-8" />
                  <div>
                    <h3 className="text-xl font-semibold">AI Profile Score</h3>
                    <p className="text-purple-100">Personalization accuracy</p>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold">94.2%</div>
                  <p className="text-purple-100">Recommendation accuracy</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Shopping Patterns</span>
                    <span>96%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preference Learning</span>
                    <span>92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Behavioral Analysis</span>
                    <span>95%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Recommendations
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Update Preferences
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Wishlist
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </div>
              </div>

              {/* Sustainability Tracker */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Sustainability Impact</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-700">Eco-friendly purchases</span>
                      <span className="text-green-900 font-medium">72%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-green-700">
                    <p>🌱 15 eco-friendly products purchased</p>
                    <p>♻️ 230kg CO₂ saved this year</p>
                    <p>📦 12 plastic-free packages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* High Priority Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-red-500" />
                High Priority Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getInsightsByPriority('high').map((insight) => (
                  <div key={insight.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-700">{insight.value}</span>
                          {insight.actionable && (
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">All Insights</h3>
              <div className="space-y-4">
                {personalizedInsights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.priority === 'high' ? 'bg-red-100' :
                          insight.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          {insight.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{insight.value}</div>
                        {insight.change && (
                          <div className={`text-sm ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {insight.change > 0 ? '↗' : '↘'} {Math.abs(insight.change)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Predictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictiveRecommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="relative">
                      <Image
                        src={recommendation.product.image}
                        alt={recommendation.product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(recommendation.urgency)}`}>
                          {recommendation.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                          {recommendation.product.confidence}% match
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{recommendation.product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.product.brand}</p>
                      <p className="text-lg font-bold text-gray-900 mb-3">{formatPrice(recommendation.product.price)}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">{recommendation.reason}</p>
                      </div>

                      {recommendation.savings && (
                        <div className="mb-3 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700 font-medium">
                            💰 Save ${recommendation.savings} with current deals
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Personalized Deals</h3>
              <div className="space-y-6">
                {personalizedDeals.map((deal) => (
                  <div key={deal.id} className="border border-orange-200 rounded-xl p-6 bg-orange-50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h4>
                        <p className="text-gray-700 mb-2">{deal.description}</p>
                        <p className="text-sm text-gray-600">{deal.reason}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-orange-600">{deal.discount}% OFF</div>
                        <p className="text-sm text-gray-600">
                          Expires in {Math.ceil((deal.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {deal.products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="w-full h-24 object-cover rounded-lg mb-3"
                          />
                          <h5 className="font-semibold text-gray-900 mb-2">{product.name}</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.salePrice)}</span>
                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Total savings: {formatPrice(deal.products.reduce((sum, p) => sum + (p.originalPrice - p.salePrice), 0))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button variant="outline">
                          Learn More
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Deal
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
