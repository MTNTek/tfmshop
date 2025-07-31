'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown, Filter, Calendar, VerifiedIcon, Camera, Video } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock review data
const productReviews = {
  product: {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999.99,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
    averageRating: 4.6,
    totalReviews: 1247,
    ratingDistribution: {
      5: 789,
      4: 312,
      3: 89,
      2: 34,
      1: 23
    }
  },
  reviews: [
    {
      id: '1',
      userId: 'user-001',
      userName: 'Sarah Johnson',
      userAvatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Absolutely amazing phone!',
      content: 'The camera quality is phenomenal, especially in low light conditions. The titanium build feels premium and the A17 Pro chip makes everything incredibly smooth. Battery life easily lasts a full day of heavy usage.',
      date: '2025-07-25',
      verified: true,
      helpful: 156,
      unhelpful: 12,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150',
        'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150'
      ],
      videos: [],
      tags: ['camera', 'performance', 'battery']
    },
    {
      id: '2',
      userId: 'user-002',
      userName: 'Mike Chen',
      userAvatar: '/api/placeholder/40/40',
      rating: 4,
      title: 'Great phone, but expensive',
      content: 'This is definitely a high-quality device with excellent performance and camera. The only downside is the price point, but if you can afford it, its worth every penny. The Action Button is a nice touch.',
      date: '2025-07-22',
      verified: true,
      helpful: 89,
      unhelpful: 8,
      images: [],
      videos: ['https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4'],
      tags: ['price', 'action-button', 'premium']
    },
    {
      id: '3',
      userId: 'user-003',
      userName: 'Lisa Wang',
      userAvatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Perfect for photography enthusiasts',
      content: 'As a photographer, I am blown away by the camera capabilities. The 48MP main camera with 5x telephoto zoom is incredible. ProRAW and ProRes video recording are game changers for content creation.',
      date: '2025-07-20',
      verified: true,
      helpful: 234,
      unhelpful: 6,
      images: [
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=150',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=150',
        'https://images.unsplash.com/photo-1607936543897-4d7c6e5a2a0c?w=150'
      ],
      videos: [],
      tags: ['photography', 'camera', 'proraw', 'video']
    },
    {
      id: '4',
      userId: 'user-004',
      userName: 'David Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      rating: 3,
      title: 'Good phone, but has some issues',
      content: 'The phone is fast and the camera is good, but I experienced some heating issues during intensive gaming. Also, the battery life could be better for such an expensive device. Overall decent but not perfect.',
      date: '2025-07-18',
      verified: false,
      helpful: 45,
      unhelpful: 23,
      images: [],
      videos: [],
      tags: ['heating', 'gaming', 'battery']
    },
    {
      id: '5',
      userId: 'user-005',
      userName: 'Emma Thompson',
      userAvatar: '/api/placeholder/40/40',
      rating: 5,
      title: 'Upgrade from iPhone 12 - worth it!',
      content: 'Coming from iPhone 12, this is a significant upgrade. The display is brighter, camera is much better, and the titanium design feels premium. USB-C is finally here! Face ID works perfectly even with masks.',
      date: '2025-07-15',
      verified: true,
      helpful: 67,
      unhelpful: 4,
      images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=150'],
      videos: [],
      tags: ['upgrade', 'display', 'usb-c', 'face-id']
    }
  ]
};

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState(productReviews.reviews);
  const [sortBy, setSortBy] = useState('most-helpful');
  const [filterRating, setFilterRating] = useState('all');
  const [filterVerified, setFilterVerified] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { product } = productReviews;

  const handleHelpfulVote = (reviewId: string, isHelpful: boolean) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              helpful: isHelpful ? review.helpful + 1 : review.helpful,
              unhelpful: !isHelpful ? review.unhelpful + 1 : review.unhelpful
            }
          : review
      )
    );
  };

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating !== 'all' && review.rating.toString() !== filterRating) return false;
      if (filterVerified && !review.verified) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'most-helpful':
          return b.helpful - a.helpful;
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest-rating':
          return b.rating - a.rating;
        case 'lowest-rating':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Product Header */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-start space-x-6">
            <Image
              src={product.image}
              alt={product.name}
              width={150}
              height={150}
              className="rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-3">{product.brand}</p>
              <p className="text-2xl font-bold text-orange-600 mb-4">{formatPrice(product.price)}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                {renderStars(Math.round(product.averageRating), 'w-5 h-5')}
                <span className="text-lg font-semibold">{product.averageRating}</span>
                <span className="text-gray-600">({product.totalReviews.toLocaleString()} reviews)</span>
              </div>

              <Button className="bg-orange-500 hover:bg-orange-600">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Rating Distribution */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
              
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = product.ratingDistribution[rating as keyof typeof product.ratingDistribution];
                const percentage = (count / product.totalReviews) * 100;
                
                return (
                  <div key={rating} className="flex items-center space-x-3 mb-2">
                    <span className="text-sm w-6">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="most-helpful">Most Helpful</option>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest-rating">Highest Rating</option>
                      <option value="lowest-rating">Lowest Rating</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Rating
                    </label>
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verified-only"
                      checked={filterVerified}
                      onChange={(e) => setFilterVerified(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="verified-only" className="ml-2 text-sm text-gray-700">
                      Verified purchases only
                    </label>
                  </div>
                </div>

                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Customer Reviews ({filteredAndSortedReviews.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {filterRating !== 'all' && `${filterRating} stars • `}
                      {filterVerified && 'Verified • '}
                      Sorted by {sortBy.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredAndSortedReviews.map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                            {review.verified && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <VerifiedIcon className="h-4 w-4" />
                                <span className="text-xs font-medium">Verified Purchase</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h3>
                        <p className="text-gray-700 mb-4">{review.content}</p>

                        {/* Review Images */}
                        {review.images.length > 0 && (
                          <div className="flex space-x-2 mb-4">
                            {review.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover cursor-pointer hover:opacity-75"
                              />
                            ))}
                          </div>
                        )}

                        {/* Review Videos */}
                        {review.videos.length > 0 && (
                          <div className="flex space-x-2 mb-4">
                            {review.videos.map((video, index) => (
                              <div key={index} className="relative">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300">
                                  <Video className="h-8 w-8 text-gray-500" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Review Tags */}
                        {review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {review.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Helpful Votes */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Was this review helpful?</span>
                            <button
                              onClick={() => handleHelpfulVote(review.id, true)}
                              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>Yes ({review.helpful})</span>
                            </button>
                            <button
                              onClick={() => handleHelpfulVote(review.id, false)}
                              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>No ({review.unhelpful})</span>
                            </button>
                          </div>
                          <Button variant="outline" size="sm">
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 text-center">
                <Button variant="outline">Load More Reviews</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
