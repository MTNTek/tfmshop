'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Star,
  Gift,
  Trophy,
  Crown,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Share2,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  Coins,
  CreditCard,
  ShoppingCart,
  Package,
  Mail,
  Phone,
  MapPin,
  Percent,
  RefreshCw,
  Download,
  Bell
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  points: number;
  totalSpent: number;
  joinDate: Date;
  lastActivity: Date;
  achievements: Achievement[];
  streakDays: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: Date;
  points: number;
  category: 'shopping' | 'social' | 'milestone' | 'special';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  value: number;
  type: 'discount' | 'free_shipping' | 'product' | 'experience' | 'cash_back';
  category: string;
  image: string;
  available: boolean;
  exclusive?: boolean;
  expiresAt?: Date;
  limitPerUser?: number;
  tier?: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  pointsReward: number;
  expiresAt: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  icon: React.ReactNode;
}

// Mock user data
const mockUser: LoyaltyMember = {
  id: '1',
  name: 'Alex Thompson',
  email: 'alex@example.com',
  tier: 'Gold',
  points: 4250,
  totalSpent: 2850,
  joinDate: new Date('2023-01-15'),
  lastActivity: new Date(),
  streakDays: 12,
  achievements: []
};

const achievements: Achievement[] = [
  {
    id: '1',
    name: 'First Purchase',
    description: 'Made your first purchase',
    icon: <ShoppingBag className="h-6 w-6" />,
    earned: true,
    earnedDate: new Date('2023-01-16'),
    points: 100,
    category: 'milestone'
  },
  {
    id: '2',
    name: 'Social Butterfly',
    description: 'Shared 5 products on social media',
    icon: <Share2 className="h-6 w-6" />,
    earned: true,
    earnedDate: new Date('2023-02-10'),
    points: 200,
    category: 'social'
  },
  {
    id: '3',
    name: 'Review Master',
    description: 'Left 10 product reviews',
    icon: <Star className="h-6 w-6" />,
    earned: false,
    points: 300,
    category: 'social'
  },
  {
    id: '4',
    name: 'Big Spender',
    description: 'Spent over $1000 in a single order',
    icon: <Trophy className="h-6 w-6" />,
    earned: true,
    earnedDate: new Date('2023-09-22'),
    points: 500,
    category: 'shopping'
  },
  {
    id: '5',
    name: 'Loyalty Legend',
    description: 'Member for over 1 year',
    icon: <Crown className="h-6 w-6" />,
    earned: true,
    earnedDate: new Date('2024-01-15'),
    points: 1000,
    category: 'milestone'
  },
  {
    id: '6',
    name: 'Early Bird',
    description: 'Made 5 purchases before 9 AM',
    icon: <Clock className="h-6 w-6" />,
    earned: false,
    points: 250,
    category: 'special'
  }
];

const rewards: Reward[] = [
  {
    id: '1',
    name: '10% Off Next Purchase',
    description: 'Get 10% discount on your next order',
    pointsCost: 500,
    value: 0,
    type: 'discount',
    category: 'discounts',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200',
    available: true
  },
  {
    id: '2',
    name: 'Free Premium Shipping',
    description: 'Free overnight shipping on any order',
    pointsCost: 300,
    value: 25,
    type: 'free_shipping',
    category: 'shipping',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200',
    available: true
  },
  {
    id: '3',
    name: 'AirPods Pro',
    description: 'Apple AirPods Pro with Noise Cancellation',
    pointsCost: 12000,
    value: 249,
    type: 'product',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200',
    available: true,
    tier: 'Gold'
  },
  {
    id: '4',
    name: '$50 Cash Back',
    description: 'Direct cash back to your account',
    pointsCost: 5000,
    value: 50,
    type: 'cash_back',
    category: 'cash',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200',
    available: true
  },
  {
    id: '5',
    name: 'VIP Shopping Experience',
    description: 'Personal shopping session with style expert',
    pointsCost: 8000,
    value: 200,
    type: 'experience',
    category: 'experiences',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    available: true,
    exclusive: true,
    tier: 'Platinum'
  },
  {
    id: '6',
    name: 'Limited Edition Tote Bag',
    description: 'Exclusive TFM Shop branded tote bag',
    pointsCost: 1500,
    value: 35,
    type: 'product',
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
    available: true,
    limitPerUser: 1
  }
];

const challenges: Challenge[] = [
  {
    id: '1',
    name: 'Daily Visitor',
    description: 'Visit the store today',
    target: 1,
    current: 1,
    pointsReward: 10,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    type: 'daily',
    icon: <Calendar className="h-5 w-5" />
  },
  {
    id: '2',
    name: 'Weekly Shopper',
    description: 'Make 3 purchases this week',
    target: 3,
    current: 1,
    pointsReward: 200,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    type: 'weekly',
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    id: '3',
    name: 'Review Streak',
    description: 'Leave reviews for 5 products',
    target: 5,
    current: 2,
    pointsReward: 500,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    type: 'monthly',
    icon: <Star className="h-5 w-5" />
  },
  {
    id: '4',
    name: 'Social Sharer',
    description: 'Share 10 products on social media',
    target: 10,
    current: 6,
    pointsReward: 300,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    type: 'monthly',
    icon: <Share2 className="h-5 w-5" />
  }
];

const tierInfo = {
  Bronze: { min: 0, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Silver: { min: 1000, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  Gold: { min: 2500, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  Platinum: { min: 5000, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  Diamond: { min: 10000, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
};

export default function LoyaltyProgramPage() {
  const [user, setUser] = useState(mockUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'achievements' | 'challenges'>('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [earnedAchievements, setEarnedAchievements] = useState(achievements.filter(a => a.earned));
  const [pointsHistory, setPointsHistory] = useState<Array<{date: Date; points: number; action: string}>>([
    { date: new Date(), points: 50, action: 'Daily login bonus' },
    { date: new Date(Date.now() - 24 * 60 * 60 * 1000), points: 100, action: 'Product purchase' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), points: 25, action: 'Product review' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), points: 200, action: 'Achievement unlocked' }
  ]);

  const getTierProgress = () => {
    const currentTier = user.tier;
    const currentPoints = user.points;
    const tiers = Object.keys(tierInfo) as Array<keyof typeof tierInfo>;
    const currentIndex = tiers.indexOf(currentTier);
    
    if (currentIndex === tiers.length - 1) {
      return { progress: 100, nextTier: null, pointsToNext: 0 };
    }
    
    const nextTier = tiers[currentIndex + 1];
    const currentTierMin = tierInfo[currentTier].min;
    const nextTierMin = tierInfo[nextTier].min;
    const progress = ((currentPoints - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
    const pointsToNext = nextTierMin - currentPoints;
    
    return { progress: Math.min(progress, 100), nextTier, pointsToNext };
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && user.points >= reward.pointsCost) {
      setUser(prev => ({
        ...prev,
        points: prev.points - reward.pointsCost
      }));
      // In a real app, this would make an API call
      alert(`Successfully redeemed: ${reward.name}!`);
    }
  };

  const getRewardsByCategory = () => {
    if (selectedCategory === 'all') return rewards;
    return rewards.filter(reward => reward.category === selectedCategory);
  };

  const categories = ['all', 'discounts', 'shipping', 'electronics', 'cash', 'experiences', 'accessories'];

  const { progress, nextTier, pointsToNext } = getTierProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">TFM Rewards</h1>
              <p className="text-gray-600">Earn points, unlock perks, and enjoy exclusive benefits</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className={`p-3 rounded-full ${tierInfo[user.tier].bg}`}>
                <Crown className={`h-6 w-6 ${tierInfo[user.tier].color}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
                { id: 'rewards', label: 'Rewards', icon: <Gift className="h-4 w-4" /> },
                { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-4 w-4" /> },
                { id: 'challenges', label: 'Challenges', icon: <Target className="h-4 w-4" /> }
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
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Points</p>
                    <p className="text-2xl font-bold text-gray-900">{user.points.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Coins className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Tier</p>
                    <p className={`text-2xl font-bold ${tierInfo[user.tier].color}`}>{user.tier}</p>
                  </div>
                  <div className={`p-3 ${tierInfo[user.tier].bg} rounded-full`}>
                    <Crown className={`h-6 w-6 ${tierInfo[user.tier].color}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(user.totalSpent)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Login Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{user.streakDays} days</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tier Progress */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tier Progress</h3>
                
                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${tierInfo[user.tier].bg} ${tierInfo[user.tier].border} border`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Crown className={`h-8 w-8 ${tierInfo[user.tier].color}`} />
                        <div>
                          <h4 className={`text-xl font-bold ${tierInfo[user.tier].color}`}>{user.tier} Member</h4>
                          <p className="text-sm text-gray-600">Current tier benefits active</p>
                        </div>
                      </div>
                      {nextTier && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Next: {nextTier}</p>
                          <p className="font-semibold text-gray-900">{pointsToNext} points to go</p>
                        </div>
                      )}
                    </div>
                    
                    {nextTier && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{tierInfo[user.tier].min} points</span>
                          <span>{tierInfo[nextTier].min} points</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tier Benefits */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Your {user.tier} Benefits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>5x points on purchases</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Free standard shipping</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Early access to sales</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Birthday bonus points</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Priority customer support</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Exclusive member rewards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {pointsHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{entry.action}</p>
                        <p className="text-xs text-gray-600">{entry.date.toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-green-600">+{entry.points}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download History
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reward Categories</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Coins className="h-4 w-4" />
                  <span>{user.points.toLocaleString()} points available</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRewardsByCategory().map((reward) => (
                <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <Image
                      src={reward.image}
                      alt={reward.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    {reward.exclusive && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Exclusive
                        </span>
                      </div>
                    )}
                    {reward.tier && (
                      <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierInfo[reward.tier as keyof typeof tierInfo].bg} ${tierInfo[reward.tier as keyof typeof tierInfo].color}`}>
                          {reward.tier}+ Only
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{reward.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{reward.pointsCost.toLocaleString()} points</span>
                      </div>
                      {reward.value > 0 && (
                        <span className="text-sm text-gray-600">Value: {formatPrice(reward.value)}</span>
                      )}
                    </div>

                    {reward.limitPerUser && (
                      <p className="text-xs text-gray-500 mb-3">Limit {reward.limitPerUser} per customer</p>
                    )}

                    <Button
                      className="w-full"
                      disabled={user.points < reward.pointsCost || !reward.available}
                      onClick={() => redeemReward(reward.id)}
                    >
                      {user.points < reward.pointsCost ? (
                        `Need ${(reward.pointsCost - user.points).toLocaleString()} more points`
                      ) : (
                        'Redeem Reward'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Achievements</h3>
                <div className="text-sm text-gray-600">
                  {earnedAchievements.length} of {achievements.length} unlocked
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      achievement.earned
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${
                        achievement.earned
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">{achievement.points} points</span>
                          </div>
                          {achievement.earned && achievement.earnedDate && (
                            <span className="text-xs text-green-600">
                              {achievement.earnedDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {achievement.earned && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">Achievement Unlocked!</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Challenges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          challenge.type === 'daily' ? 'bg-blue-100 text-blue-600' :
                          challenge.type === 'weekly' ? 'bg-green-100 text-green-600' :
                          challenge.type === 'monthly' ? 'bg-purple-100 text-purple-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {challenge.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        challenge.type === 'daily' ? 'bg-blue-100 text-blue-800' :
                        challenge.type === 'weekly' ? 'bg-green-100 text-green-800' :
                        challenge.type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {challenge.type}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress: {challenge.current} / {challenge.target}</span>
                        <span>Expires: {challenge.expiresAt.toLocaleDateString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">{challenge.pointsReward} points</span>
                      </div>
                      {challenge.current >= challenge.target && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Earn More Points</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Shopping Activities</h4>
                  <p className="text-sm text-gray-600 mb-4">Earn points for every purchase, review, and referral</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Purchase</span>
                      <span className="font-medium">1 point per $1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product Review</span>
                      <span className="font-medium">25 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Referral</span>
                      <span className="font-medium">500 points</span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Social Activities</h4>
                  <p className="text-sm text-gray-600 mb-4">Share products and engage with the community</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Social Share</span>
                      <span className="font-medium">10 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Photo Review</span>
                      <span className="font-medium">50 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Helpful Vote</span>
                      <span className="font-medium">5 points</span>
                    </div>
                  </div>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Daily Activities</h4>
                  <p className="text-sm text-gray-600 mb-4">Log in daily and complete simple tasks</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Daily Login</span>
                      <span className="font-medium">10 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Streak</span>
                      <span className="font-medium">100 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Streak</span>
                      <span className="font-medium">500 points</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
