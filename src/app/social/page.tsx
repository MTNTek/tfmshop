'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  User,
  Camera,
  Video,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Send,
  Smile,
  Tag,
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  Users,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Crown,
  Verified,
  Award,
  Gift,
  Zap,
  Eye,
  Clock,
  Calendar,
  ShoppingBag,
  Target,
  Sparkles
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SocialPost {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    followerCount: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  };
  type: 'photo' | 'video' | 'story' | 'review' | 'haul' | 'outfit';
  content: {
    media: string[];
    caption: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      brand: string;
    }>;
    hashtags: string[];
    mentions: string[];
    location?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views?: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  timestamp: Date;
  isSponsored?: boolean;
  rating?: number;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followerCount: number;
  category: string;
  isFollowing: boolean;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  stats: {
    posts: number;
    avgLikes: number;
    engagement: number;
  };
}

// Mock data
const mockPosts: SocialPost[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Emma Chen',
      username: '@emmastyle',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812-icon?w=100',
      verified: true,
      followerCount: 125000,
      tier: 'Gold'
    },
    type: 'outfit',
    content: {
      media: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'],
      caption: 'Perfect fall outfit for the office! Love how this blazer pairs with these boots 🍂✨ Use code EMMA15 for 15% off!',
      products: [
        {
          id: '1',
          name: 'Wool Blend Blazer',
          price: 159.99,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100',
          brand: 'StyleCo'
        },
        {
          id: '2',
          name: 'Leather Ankle Boots',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=100',
          brand: 'BootBrand'
        }
      ],
      hashtags: ['#fallstyle', '#officewear', '#sponsored'],
      mentions: ['@styleco', '@bootbrand'],
      location: 'New York, NY'
    },
    engagement: {
      likes: 3420,
      comments: 156,
      shares: 89,
      saves: 234,
      views: 15600
    },
    isLiked: false,
    isSaved: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isSponsored: true,
    rating: 5
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Tech Mike',
      username: '@techmike',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      verified: true,
      followerCount: 89000,
      tier: 'Platinum'
    },
    type: 'review',
    content: {
      media: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500'],
      caption: 'Just unboxed the new MacBook Pro M3! The performance is incredible 🚀 Full review coming tomorrow. What do you want me to test first?',
      products: [
        {
          id: '3',
          name: 'MacBook Pro 14-inch M3',
          price: 1999.99,
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
          brand: 'Apple'
        }
      ],
      hashtags: ['#macbook', '#apple', '#tech', '#review'],
      mentions: ['@apple']
    },
    engagement: {
      likes: 2850,
      comments: 203,
      shares: 145,
      saves: 890,
      views: 25400
    },
    isLiked: true,
    isSaved: false,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    rating: 5
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Fitness Sarah',
      username: '@fitnessarah',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      verified: false,
      followerCount: 45000,
      tier: 'Silver'
    },
    type: 'haul',
    content: {
      media: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'],
      caption: 'Huge fitness haul! These leggings are AMAZING and the sports bras are so supportive 💪 Everything is on sale right now!',
      products: [
        {
          id: '4',
          name: 'High-Waist Leggings',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1506629905607-bb5cf4bb34ad?w=100',
          brand: 'ActiveWear'
        },
        {
          id: '5',
          name: 'Sports Bra Set',
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
          brand: 'FitGear'
        }
      ],
      hashtags: ['#fitness', '#activewear', '#haul', '#sale'],
      mentions: ['@activewear', '@fitgear']
    },
    engagement: {
      likes: 1650,
      comments: 87,
      shares: 43,
      saves: 156,
      views: 8900
    },
    isLiked: false,
    isSaved: false,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
  }
];

const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Emma Chen',
    username: '@emmastyle',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812-icon?w=100',
    verified: true,
    followerCount: 125000,
    category: 'Fashion',
    isFollowing: true,
    tier: 'Gold',
    stats: {
      posts: 245,
      avgLikes: 3200,
      engagement: 4.8
    }
  },
  {
    id: '2',
    name: 'Tech Mike',
    username: '@techmike',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    verified: true,
    followerCount: 89000,
    category: 'Technology',
    isFollowing: false,
    tier: 'Platinum',
    stats: {
      posts: 189,
      avgLikes: 2800,
      engagement: 5.2
    }
  }
];

export default function SocialShoppingPage() {
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'creators' | 'trending'>('feed');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          engagement: {
            ...post.engagement,
            likes: post.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1
          }
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isSaved: !post.isSaved,
          engagement: {
            ...post.engagement,
            saves: post.isSaved ? post.engagement.saves - 1 : post.engagement.saves + 1
          }
        };
      }
      return post;
    }));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600';
      case 'Silver': return 'text-gray-600';
      case 'Gold': return 'text-yellow-600';
      case 'Platinum': return 'text-purple-600';
      case 'Diamond': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const PostCard = ({ post }: { post: SocialPost }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={post.user.avatar}
              alt={post.user.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            {post.user.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Verified className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{post.user.name}</h4>
              <Crown className={`h-4 w-4 ${getTierColor(post.user.tier)}`} />
              {post.isSponsored && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Sponsored
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{post.user.username}</span>
              <span>•</span>
              <span>{getTimeAgo(post.timestamp)}</span>
              {post.content.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.content.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.engagement.views && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{post.engagement.views.toLocaleString()}</span>
            </div>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Post Media */}
      <div className="relative">
        <Image
          src={post.content.media[0]}
          alt="Post content"
          width={600}
          height={400}
          className="w-full h-80 object-cover"
        />
        
        {/* Product Tags */}
        {post.content.products.length > 0 && (
          <div className="absolute bottom-4 left-4">
            <Button size="sm" className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm">
              <Tag className="h-4 w-4 mr-1" />
              {post.content.products.length} product{post.content.products.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm ${
            post.type === 'outfit' ? 'bg-pink-500/80' :
            post.type === 'review' ? 'bg-blue-500/80' :
            post.type === 'haul' ? 'bg-green-500/80' :
            'bg-purple-500/80'
          }`}>
            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleLike(post.id)}
              className="flex items-center space-x-2 transition-colors"
            >
              <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
              <span className="text-sm font-medium text-gray-900">{post.engagement.likes.toLocaleString()}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(showComments === post.id ? null : post.id)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium text-gray-900">{post.engagement.comments}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
              <Share2 className="h-6 w-6" />
              <span className="text-sm font-medium text-gray-900">{post.engagement.shares}</span>
            </button>
          </div>
          
          <button 
            onClick={() => handleSave(post.id)}
            className="text-gray-600 hover:text-yellow-500 transition-colors"
          >
            <Bookmark className={`h-6 w-6 ${post.isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
        </div>

        {/* Post Caption */}
        <div className="mb-4">
          <p className="text-gray-900 mb-2">{post.content.caption}</p>
          
          {/* Rating */}
          {post.rating && (
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < post.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">({post.rating}/5)</span>
            </div>
          )}
          
          {/* Hashtags */}
          <div className="flex flex-wrap gap-1">
            {post.content.hashtags.map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tagged Products */}
        {post.content.products.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h5 className="font-medium text-gray-900 mb-3">Shop this post</h5>
            <div className="space-y-3">
              {post.content.products.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900">{product.name}</h6>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                  <Button size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments === post.id && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="space-y-3 mb-4">
              {/* Mock comments */}
              <div className="flex items-start space-x-3">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40"
                  alt="Commenter"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">john_doe</span>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <p className="text-sm text-gray-700">Love this outfit! Where did you get that blazer? 😍</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">Reply</button>
                    <span className="text-xs text-gray-500">12 likes</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Comment */}
            <div className="flex items-center space-x-3">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40"
                alt="Your avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Shopping</h1>
              <p className="text-gray-600">Discover products through authentic reviews and style inspiration</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, products, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'feed', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
                { id: 'discover', label: 'Discover', icon: <Search className="h-4 w-4" /> },
                { id: 'creators', label: 'Creators', icon: <Users className="h-4 w-4" /> },
                { id: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> }
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'feed' && (
              <div>
                {/* Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Filter className="h-5 w-5 text-gray-400" />
                      <div className="flex space-x-2">
                        {['all', 'outfit', 'review', 'haul'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedFilter === filter
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent
                    </Button>
                  </div>
                </div>

                {/* Posts Feed */}
                <div>
                  {posts
                    .filter(post => selectedFilter === 'all' || post.type === selectedFilter)
                    .map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'creators' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Creators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockCreators.map((creator) => (
                      <div key={creator.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <Image
                              src={creator.avatar}
                              alt={creator.name}
                              width={60}
                              height={60}
                              className="rounded-full object-cover"
                            />
                            {creator.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <Verified className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{creator.name}</h4>
                              <Crown className={`h-4 w-4 ${getTierColor(creator.tier)}`} />
                            </div>
                            <p className="text-sm text-gray-600">{creator.username}</p>
                            <p className="text-xs text-gray-500">{creator.followerCount.toLocaleString()} followers</p>
                          </div>
                          <Button
                            size="sm"
                            variant={creator.isFollowing ? "outline" : "default"}
                          >
                            {creator.isFollowing ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{creator.stats.posts}</p>
                            <p className="text-gray-600">Posts</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{creator.stats.avgLikes.toLocaleString()}</p>
                            <p className="text-gray-600">Avg Likes</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{creator.stats.engagement}%</p>
                            <p className="text-gray-600">Engagement</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {creator.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                Trending Now
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Oversized Blazer', trend: '+156%', price: 89.99 },
                  { name: 'Chunky Sneakers', trend: '+124%', price: 129.99 },
                  { name: 'Gold Jewelry', trend: '+98%', price: 49.99 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-green-600">{item.trend} interest</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price)}</p>
                      <Button size="sm" variant="outline" className="text-xs mt-1">
                        Shop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Social Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Total Likes Received</span>
                  </div>
                  <span className="font-semibold text-gray-900">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Followers</span>
                  </div>
                  <span className="font-semibold text-gray-900">567</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Products Shared</span>
                  </div>
                  <span className="font-semibold text-gray-900">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Influence Score</span>
                  </div>
                  <span className="font-semibold text-gray-900">8.4/10</span>
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <Camera className="h-4 w-4 mr-2" />
                Share Your Style
              </Button>
            </div>

            {/* Challenges */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-600" />
                Social Challenges
              </h3>
              <div className="space-y-3">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Share 5 outfits</span>
                    <span className="text-xs text-purple-600">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Reward: 500 points</p>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Get 100 likes</span>
                    <span className="text-xs text-purple-600">67/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Reward: Free shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
