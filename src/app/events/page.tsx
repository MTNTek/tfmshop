'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  Share2,
  Tag,
  Gift,
  Ticket,
  Camera,
  Video,
  Mic,
  Coffee,
  ShoppingBag,
  Trophy,
  Sparkles,
  Bell,
  Check,
  Plus,
  ArrowRight,
  Filter,
  Search,
  ChevronDown,
  Zap,
  Eye,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ShoppingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: {
    type: 'online' | 'physical' | 'hybrid';
    address?: string;
    platform?: string;
  };
  host: {
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    followers: number;
  };
  category: string;
  tags: string[];
  image: string;
  attendees: number;
  maxAttendees?: number;
  price: number;
  originalPrice?: number;
  status: 'upcoming' | 'live' | 'ended';
  featured: boolean;
  perks: string[];
  products: EventProduct[];
  reviews: EventReview[];
  specialOffers: SpecialOffer[];
}

interface EventProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  eventDiscount?: number;
  exclusiveToEvent: boolean;
}

interface EventReview {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  type: 'early-bird' | 'exclusive' | 'bundle' | 'flash';
}

// Mock events data
const mockEvents: ShoppingEvent[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max Launch Experience',
    description: 'Join us for an exclusive hands-on experience with the new iPhone 15 Pro Max. Learn about cutting-edge features, test the cameras, and get special launch pricing.',
    date: '2025-08-15',
    time: '19:00',
    duration: '2h 30min',
    location: {
      type: 'hybrid',
      address: 'Apple Store, Fifth Avenue, NYC',
      platform: 'Live Stream + In-Person'
    },
    host: {
      name: 'Tech Insider Team',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      verified: true,
      rating: 4.9,
      followers: 250000
    },
    category: 'Technology',
    tags: ['iPhone', 'Apple', 'Launch Event', 'Exclusive', 'Hands-on'],
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    attendees: 1847,
    maxAttendees: 2000,
    price: 0,
    status: 'upcoming',
    featured: true,
    perks: [
      'Exclusive launch pricing (up to 15% off)',
      'Free premium case with purchase',
      'Priority support setup',
      'Meet Apple engineers',
      'Live Q&A session'
    ],
    products: [
      {
        id: 'p1',
        name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        price: 1019.99,
        originalPrice: 1199.99,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
        eventDiscount: 15,
        exclusiveToEvent: true
      },
      {
        id: 'p2',
        name: 'Premium Leather Case',
        brand: 'Apple',
        price: 0,
        originalPrice: 79.99,
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200',
        eventDiscount: 100,
        exclusiveToEvent: true
      }
    ],
    reviews: [
      {
        id: '1',
        user: 'TechEnthusiast92',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50',
        rating: 5,
        comment: 'Amazing event! Got hands-on with the new iPhone and the deals were incredible. Highly recommend!',
        date: '2025-07-20',
        verified: true
      }
    ],
    specialOffers: [
      {
        id: 'offer1',
        title: 'Early Bird Special',
        description: 'Register now and get additional 5% off + free accessories',
        discount: 5,
        validUntil: '2025-08-10',
        type: 'early-bird'
      }
    ]
  },
  {
    id: '2',
    title: 'Summer Fashion Workshop & Shopping Spree',
    description: 'Discover the latest summer trends with professional stylists. Learn styling tips, mix & match techniques, and shop exclusive collections.',
    date: '2025-08-20',
    time: '14:00',
    duration: '3h 0min',
    location: {
      type: 'physical',
      address: 'Fashion District Studio, Manhattan'
    },
    host: {
      name: 'Style Maven Studios',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b65c?w=100',
      verified: true,
      rating: 4.8,
      followers: 180000
    },
    category: 'Fashion',
    tags: ['Summer Fashion', 'Styling Workshop', 'Trends', 'Personal Shopping'],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    attendees: 87,
    maxAttendees: 120,
    price: 49.99,
    originalPrice: 89.99,
    status: 'upcoming',
    featured: false,
    perks: [
      'Personal styling consultation (30 min)',
      'Exclusive 30% off workshop items',
      'Professional photos of your looks',
      'Goodie bag worth $150',
      'Access to private sale'
    ],
    products: [
      {
        id: 'p3',
        name: 'Summer Floral Maxi Dress',
        brand: 'Zara',
        price: 48.99,
        originalPrice: 69.99,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200',
        eventDiscount: 30,
        exclusiveToEvent: false
      }
    ],
    reviews: [],
    specialOffers: []
  },
  {
    id: '3',
    title: 'Smart Home Revolution: IoT & Automation',
    description: 'Explore the future of smart homes with hands-on demos of the latest IoT devices, home automation systems, and AI assistants.',
    date: '2025-08-25',
    time: '18:30',
    duration: '2h 0min',
    location: {
      type: 'online',
      platform: 'Virtual Reality Experience'
    },
    host: {
      name: 'Smart Living Co.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      verified: true,
      rating: 4.7,
      followers: 95000
    },
    category: 'Smart Home',
    tags: ['IoT', 'Smart Home', 'Automation', 'AI', 'Future Tech'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    attendees: 456,
    price: 29.99,
    status: 'upcoming',
    featured: true,
    perks: [
      'VR headset rental included',
      'Live demos of 20+ smart devices',
      'Bundle deals up to 40% off',
      'Free installation consultation',
      'Smart home starter kit'
    ],
    products: [],
    reviews: [],
    specialOffers: []
  }
];

export default function ShoppingEventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Technology', 'Fashion', 'Smart Home', 'Beauty', 'Lifestyle'];
  const eventTypes = ['all', 'upcoming', 'live', 'free', 'premium'];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesType = selectedType === 'all' || 
      (selectedType === 'free' && event.price === 0) ||
      (selectedType === 'premium' && event.price > 0) ||
      event.status === selectedType;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const sortedEvents = filteredEvents.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price':
        return a.price - b.price;
      case 'popularity':
        return b.attendees - a.attendees;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="h-4 w-4" />;
      case 'physical': return <MapPin className="h-4 w-4" />;
      case 'hybrid': return <Users className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Events</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live Events
                </span>
              </div>
              <p className="text-gray-600">Exclusive shopping experiences, workshops, and product launches</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Event Alerts
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters & Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : 
                     type === 'free' ? 'Free Events' :
                     type === 'premium' ? 'Premium Events' :
                     type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Events</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedEvents.filter(event => event.featured).map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={600}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{new Date(event.date).getDate()}</div>
                      <div className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                    </div>
                    <button className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{event.time} • {event.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getLocationIcon(event.location.type)}
                      <span>{event.location.type === 'online' ? event.location.platform : 'In-Person'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} attending</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>{event.price === 0 ? 'Free' : formatPrice(event.price)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={event.host.avatar}
                        alt={event.host.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-900">{event.host.name}</span>
                          {event.host.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(event.host.rating)}
                          <span className="text-xs text-gray-500">({event.host.followers.toLocaleString()} followers)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.price === 0 ? 'Join Free' : 'Register Now'}
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
            <span className="text-gray-600">{sortedEvents.length} events found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>}
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getLocationIcon(event.location.type)}
                      <span className="truncate">
                        {event.location.type === 'online' ? event.location.platform : event.location.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {event.price === 0 ? 'Free' : formatPrice(event.price)}
                        {event.originalPrice && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            {formatPrice(event.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    {event.price === 0 ? 'Join Free' : 'Register'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Host Your Own Shopping Event</h2>
          <p className="text-lg mb-6 opacity-90">
            Share your expertise, showcase products, and build your community with our event platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              Learn More
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
