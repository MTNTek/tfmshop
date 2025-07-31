'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Users,
  Heart,
  ShoppingCart,
  MessageCircle,
  Share2,
  Star,
  Clock,
  Gift,
  Zap,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Eye,
  ThumbsUp,
  Send,
  Sparkles,
  Trophy,
  Tag,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface LiveStream {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  viewers: number;
  duration: string;
  category: string;
  tags: string[];
  thumbnail: string;
  isLive: boolean;
  products: LiveProduct[];
  chat: ChatMessage[];
  specialOffers: SpecialOffer[];
}

interface LiveProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
  featured: boolean;
  liveDiscount?: number;
  timeLeft?: string;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  type: 'message' | 'purchase' | 'heart' | 'join';
  verified?: boolean;
}

interface SpecialOffer {
  id: string;
  title: string;
  discount: number;
  timeLeft: string;
  claimed: number;
  total: number;
  productId: string;
}

// Mock live streams data
const mockLiveStreams: LiveStream[] = [
  {
    id: '1',
    title: 'Tech Tuesday: Latest iPhone 15 Pro Features & Accessories',
    host: {
      name: 'TechGuru_Mike',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      verified: true,
      followers: 125600
    },
    viewers: 2847,
    duration: '1:23:45',
    category: 'Electronics',
    tags: ['iPhone', 'Apple', 'Tech Review', 'Accessories'],
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    isLive: true,
    products: [
      {
        id: 'p1',
        name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        price: 1099.99,
        originalPrice: 1199.99,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
        rating: 4.8,
        inStock: true,
        featured: true,
        liveDiscount: 8,
        timeLeft: '02:15:30'
      },
      {
        id: 'p2',
        name: 'iPhone 15 Pro Case - Leather',
        brand: 'Apple',
        price: 59.99,
        originalPrice: 79.99,
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200',
        rating: 4.6,
        inStock: true,
        featured: false,
        liveDiscount: 25
      }
    ],
    chat: [
      { id: '1', user: 'TechLover23', message: 'This iPhone camera is amazing! 📸', timestamp: '2 min ago', type: 'message' },
      { id: '2', user: 'ShopperQueen', message: 'Just bought the case! Thanks for the demo 🛍️', timestamp: '3 min ago', type: 'purchase' },
      { id: '3', user: 'GadgetFan', message: '❤️', timestamp: '3 min ago', type: 'heart' },
      { id: '4', user: 'NewUser2024', message: 'Hi everyone! First time watching', timestamp: '4 min ago', type: 'join' }
    ],
    specialOffers: [
      {
        id: 'offer1',
        title: 'Lightning Deal: iPhone Case Bundle',
        discount: 30,
        timeLeft: '00:15:42',
        claimed: 127,
        total: 200,
        productId: 'p2'
      }
    ]
  },
  {
    id: '2',
    title: 'Fashion Friday: Summer Style Essentials & Styling Tips',
    host: {
      name: 'StyleInfluencer_Sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b65c?w=100',
      verified: true,
      followers: 89400
    },
    viewers: 1923,
    duration: '0:45:12',
    category: 'Fashion',
    tags: ['Summer Fashion', 'Styling Tips', 'Outfits', 'Trends'],
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    isLive: true,
    products: [
      {
        id: 'p3',
        name: 'Summer Floral Dress',
        brand: 'Zara',
        price: 49.99,
        originalPrice: 69.99,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200',
        rating: 4.5,
        inStock: true,
        featured: true,
        liveDiscount: 28
      }
    ],
    chat: [],
    specialOffers: []
  }
];

export default function LiveShoppingPage() {
  const [selectedStream, setSelectedStream] = useState<LiveStream>(mockLiveStreams[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showProducts, setShowProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'products' | 'offers'>('products');
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSelectedStream(prev => ({
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 10) - 5,
        chat: [
          {
            id: Date.now().toString(),
            user: `User${Math.floor(Math.random() * 1000)}`,
            message: ['Great product!', 'Love this!', '❤️', 'Where can I buy this?', 'Amazing quality!'][Math.floor(Math.random() * 5)],
            timestamp: 'now',
            type: 'message'
          },
          ...prev.chat.slice(0, 15)
        ]
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setSelectedStream(prev => ({
        ...prev,
        chat: [
          {
            id: Date.now().toString(),
            user: 'You',
            message: chatMessage,
            timestamp: 'now',
            type: 'message'
          },
          ...prev.chat
        ]
      }));
      setChatMessage('');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Video className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Shopping</h1>
                <p className="text-gray-600">Shop live with our expert hosts</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                LIVE
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                <span>{selectedStream.viewers.toLocaleString()} watching</span>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
              {/* Video Player */}
              <div ref={videoRef} className="relative w-full h-full">
                <Image
                  src={selectedStream.thumbnail}
                  alt={selectedStream.title}
                  fill
                  className="object-cover"
                />
                
                {/* Live Badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span>LIVE</span>
                </div>

                {/* Viewer Count */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <Eye className="h-3 w-3" />
                  <span>{selectedStream.viewers.toLocaleString()}</span>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      
                      <span className="text-white text-sm">{selectedStream.duration}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-white hover:bg-white/20"
                      >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Floating Hearts Animation */}
                <div className="absolute bottom-20 right-4 pointer-events-none">
                  {[1, 2, 3].map((heart) => (
                    <Heart
                      key={heart}
                      className="h-6 w-6 text-red-500 fill-current animate-bounce absolute"
                      style={{
                        animationDelay: `${heart * 0.5}s`,
                        bottom: `${heart * 20}px`,
                        right: `${Math.random() * 40}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedStream.title}</h2>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={selectedStream.host.avatar}
                        alt={selectedStream.host.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{selectedStream.host.name}</span>
                          {selectedStream.host.verified && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{selectedStream.host.followers.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedStream.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'products'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Products</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'chat'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'offers'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Gift className="h-4 w-4" />
                    <span>Deals</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="h-96 overflow-y-auto">
                {activeTab === 'products' && (
                  <div className="p-4 space-y-4">
                    {selectedStream.products.map((product) => (
                      <div key={product.id} className={`border rounded-lg p-3 ${product.featured ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                        {product.featured && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">Featured Now</span>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">{product.name}</h4>
                            <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
                            
                            <div className="flex items-center space-x-1 mb-2">
                              {renderStars(product.rating)}
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                              {product.liveDiscount && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  -{product.liveDiscount}%
                                </span>
                              )}
                            </div>
                            
                            {product.timeLeft && (
                              <div className="flex items-center space-x-1 mb-2 text-xs text-red-600">
                                <Clock className="h-3 w-3" />
                                <span>{product.timeLeft}</span>
                              </div>
                            )}
                            
                            <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {selectedStream.chat.map((message) => (
                        <div key={message.id} className="flex items-start space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-sm text-gray-900">{message.user}</span>
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                              {message.type === 'purchase' && (
                                <ShoppingCart className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <Button size="sm" onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'offers' && (
                  <div className="p-4 space-y-4">
                    {selectedStream.specialOffers.map((offer) => (
                      <div key={offer.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-red-600" />
                          <span className="font-semibold text-red-900">Lightning Deal</span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{offer.title}</h4>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl font-bold text-red-600">{offer.discount}% OFF</span>
                          <div className="flex items-center space-x-1 text-sm text-red-600">
                            <Clock className="h-3 w-3" />
                            <span>{offer.timeLeft}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Claimed</span>
                            <span>{offer.claimed}/{offer.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(offer.claimed / offer.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Deal
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Other Live Streams */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Other Live Streams</h3>
              <div className="space-y-3">
                {mockLiveStreams.filter(stream => stream.id !== selectedStream.id).map((stream) => (
                  <div 
                    key={stream.id}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="relative">
                      <Image
                        src={stream.thumbnail}
                        alt={stream.title}
                        width={60}
                        height={40}
                        className="rounded object-cover"
                      />
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                        LIVE
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{stream.title}</h4>
                      <p className="text-xs text-gray-600">{stream.host.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        <span>{stream.viewers.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
