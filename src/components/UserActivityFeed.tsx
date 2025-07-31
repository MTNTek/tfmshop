'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Activity,
  User,
  ShoppingCart,
  Heart,
  Star,
  Package,
  CreditCard,
  MessageCircle,
  Eye,
  Share2,
  Clock,
  TrendingUp,
  Gift,
  Award,
  Bell,
  X
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'purchase' | 'review' | 'wishlist' | 'view' | 'share' | 'achievement' | 'message' | 'return';
  user: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
  };
  timestamp: Date;
  content: string;
  metadata?: {
    product?: {
      id: string;
      name: string;
      image: string;
      price?: number;
    };
    rating?: number;
    amount?: number;
    points?: number;
    badge?: string;
  };
}

const generateActivityFeed = (): ActivityItem[] => {
  const users = [
    { id: '1', name: 'Sarah Johnson', avatar: '/api/placeholder/40/40', verified: true },
    { id: '2', name: 'Mike Chen', avatar: '/api/placeholder/40/40' },
    { id: '3', name: 'Emily Davis', avatar: '/api/placeholder/40/40', verified: true },
    { id: '4', name: 'David Wilson', avatar: '/api/placeholder/40/40' },
    { id: '5', name: 'Lisa Wang', avatar: '/api/placeholder/40/40', verified: true },
    { id: '6', name: 'John Smith', avatar: '/api/placeholder/40/40' },
    { id: '7', name: 'Anna Rodriguez', avatar: '/api/placeholder/40/40' },
    { id: '8', name: 'Robert Brown', avatar: '/api/placeholder/40/40', verified: true }
  ];

  const products = [
    { id: '1', name: 'iPhone 15 Pro', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100', price: 999.99 },
    { id: '2', name: 'MacBook Pro 14"', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100', price: 1999.99 },
    { id: '3', name: 'Sony Headphones', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100', price: 349.99 },
    { id: '4', name: 'Samsung Galaxy S24', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', price: 899.99 },
    { id: '5', name: 'iPad Pro 12.9"', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100', price: 1099.99 }
  ];

  const activities: ActivityItem[] = [];
  const now = new Date();

  // Generate activities
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days

    const activityTypes = ['purchase', 'review', 'wishlist', 'view', 'share', 'achievement', 'message'];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)] as ActivityItem['type'];

    let content = '';
    let metadata: ActivityItem['metadata'] = {};

    switch (type) {
      case 'purchase':
        content = `purchased ${product.name}`;
        metadata = { product, amount: product.price };
        break;
      case 'review':
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        content = `left a ${rating}-star review for ${product.name}`;
        metadata = { product, rating };
        break;
      case 'wishlist':
        content = `added ${product.name} to their wishlist`;
        metadata = { product };
        break;
      case 'view':
        content = `viewed ${product.name}`;
        metadata = { product };
        break;
      case 'share':
        content = `shared ${product.name} with friends`;
        metadata = { product };
        break;
      case 'achievement':
        const badges = ['First Purchase', 'Top Reviewer', 'Loyal Customer', 'Deal Hunter'];
        const badge = badges[Math.floor(Math.random() * badges.length)];
        const points = Math.floor(Math.random() * 500) + 100;
        content = `earned the "${badge}" badge`;
        metadata = { badge, points };
        break;
      case 'message':
        content = `left a question about ${product.name}`;
        metadata = { product };
        break;
    }

    activities.push({
      id: `${i + 1}`,
      type,
      user,
      timestamp,
      content,
      metadata
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export default function UserActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'reviews' | 'social'>('all');
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setActivities(generateActivityFeed());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'purchases') return activity.type === 'purchase';
    if (filter === 'reviews') return activity.type === 'review';
    if (filter === 'social') return ['wishlist', 'share', 'message'].includes(activity.type);
    return true;
  });

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'wishlist':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'view':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-600" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-orange-600" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-indigo-600" />;
      case 'return':
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 border-green-200';
      case 'review':
        return 'bg-yellow-100 border-yellow-200';
      case 'wishlist':
        return 'bg-red-100 border-red-200';
      case 'view':
        return 'bg-blue-100 border-blue-200';
      case 'share':
        return 'bg-purple-100 border-purple-200';
      case 'achievement':
        return 'bg-orange-100 border-orange-200';
      case 'message':
        return 'bg-indigo-100 border-indigo-200';
      case 'return':
        return 'bg-gray-100 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <Activity className="h-5 w-5 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80">
      <div className="bg-white rounded-lg shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-white" />
              <h3 className="text-white font-semibold">Live Activity</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-orange-600 p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex mt-3 space-x-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'purchases', label: 'Purchases' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'social', label: 'Social' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-orange-600 font-medium'
                    : 'text-orange-100 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Image
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {activity.user.name}
                        </span>
                        {activity.user.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{activity.content}</p>
                      
                      {/* Metadata */}
                      {activity.metadata?.product && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <Image
                            src={activity.metadata.product.image}
                            alt={activity.metadata.product.name}
                            width={24}
                            height={24}
                            className="rounded object-cover"
                          />
                          <span className="text-xs text-gray-600 truncate">
                            {activity.metadata.product.name}
                          </span>
                          {activity.metadata.product.price && (
                            <span className="text-xs font-medium text-gray-900">
                              {formatPrice(activity.metadata.product.price)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {activity.metadata?.rating && (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= activity.metadata!.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {activity.metadata?.badge && (
                        <div className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          <Award className="w-3 h-3" />
                          <span>{activity.metadata.badge}</span>
                          {activity.metadata.points && (
                            <span className="font-medium">+{activity.metadata.points} pts</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && filteredActivities.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <TrendingUp className="h-3 w-3" />
              <span>{filteredActivities.length} activities</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-6">
              View All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
