'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Settings, X, Package, Truck, Star, DollarSign, Heart } from 'lucide-react';

// Mock notifications data
const initialNotifications = [
  {
    id: '1',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #TFM-2024-001 has been delivered successfully!',
    timestamp: '2 hours ago',
    read: false,
    icon: Package,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: '2',
    type: 'shipping',
    title: 'Package Out for Delivery',
    message: 'Your iPhone 15 Pro is out for delivery and will arrive today.',
    timestamp: '4 hours ago',
    read: false,
    icon: Truck,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: '3',
    type: 'deal',
    title: 'Price Drop Alert',
    message: 'MacBook Pro 14" price dropped by $200! Now $1,799.99',
    timestamp: '1 day ago',
    read: true,
    icon: DollarSign,
    color: 'text-orange-600 bg-orange-100'
  },
  {
    id: '4',
    type: 'review',
    title: 'Review Reminder',
    message: 'How was your Nike Air Max 270? Leave a review and help others!',
    timestamp: '2 days ago',
    read: true,
    icon: Star,
    color: 'text-yellow-600 bg-yellow-100'
  },
  {
    id: '5',
    type: 'wishlist',
    title: 'Wishlist Item Back in Stock',
    message: 'Samsung 65" 4K Smart TV is now available and ready to order!',
    timestamp: '3 days ago',
    read: true,
    icon: Heart,
    color: 'text-red-600 bg-red-100'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications =>
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications =>
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      all: 'All',
      unread: 'Unread',
      order: 'Orders',
      shipping: 'Shipping',
      deal: 'Deals',
      review: 'Reviews',
      wishlist: 'Wishlist'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-orange-500" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  Mark all as read
                </Button>
              )}
              <Button onClick={clearAll} variant="outline" className="text-red-600">
                Clear all
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Filter</h2>
              <div className="space-y-2">
                {['all', 'unread', 'order', 'shipping', 'deal', 'review', 'wishlist'].map((type) => {
                  const count = type === 'all' 
                    ? notifications.length 
                    : type === 'unread'
                    ? unreadCount
                    : notifications.filter(n => n.type === type).length;
                    
                  return (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                        filter === type
                          ? 'bg-orange-100 text-orange-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{getTypeLabel(type)}</span>
                      {count > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          filter === type ? 'bg-orange-200' : 'bg-gray-200'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Bell className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                <p className="mt-2 text-gray-600">
                  {filter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${getTypeLabel(filter).toLowerCase()} notifications`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md ${
                        !notification.read ? 'border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${notification.color}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className={`text-lg font-medium ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h3>
                                  <p className="mt-1 text-gray-600 text-sm">
                                    {notification.message}
                                  </p>
                                  <p className="mt-2 text-xs text-gray-500">
                                    {notification.timestamp}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="ml-4">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="mt-4 flex items-center space-x-3">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                {notification.type === 'order' && (
                                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View order
                                  </button>
                                )}
                                {notification.type === 'deal' && (
                                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                    View deal
                                  </button>
                                )}
                                {notification.type === 'review' && (
                                  <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                    Write review
                                  </button>
                                )}
                                {notification.type === 'wishlist' && (
                                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                    View item
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              {[
                { id: 'order-updates', label: 'Order updates and tracking', enabled: true },
                { id: 'price-drops', label: 'Price drop alerts', enabled: true },
                { id: 'new-deals', label: 'New deals and promotions', enabled: false },
                { id: 'product-recommendations', label: 'Product recommendations', enabled: true }
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <label htmlFor={setting.id} className="text-sm text-gray-700">
                    {setting.label}
                  </label>
                  <input
                    type="checkbox"
                    id={setting.id}
                    defaultChecked={setting.enabled}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              {[
                { id: 'push-orders', label: 'Order updates', enabled: true },
                { id: 'push-deals', label: 'Daily deals', enabled: false },
                { id: 'push-wishlist', label: 'Wishlist restocks', enabled: true },
                { id: 'push-reviews', label: 'Review reminders', enabled: false }
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <label htmlFor={setting.id} className="text-sm text-gray-700">
                    {setting.label}
                  </label>
                  <input
                    type="checkbox"
                    id={setting.id}
                    defaultChecked={setting.enabled}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
