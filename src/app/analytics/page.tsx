'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Star,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock analytics data
const analyticsData = {
  overview: {
    totalRevenue: 125678.90,
    revenueChange: 12.5,
    totalOrders: 1847,
    ordersChange: 8.3,
    totalCustomers: 3456,
    customersChange: 15.2,
    averageOrderValue: 68.12,
    aovChange: -2.1,
    conversionRate: 3.8,
    conversionChange: 0.5
  },
  recentSales: [
    {
      id: '1',
      customer: 'Sarah Johnson',
      product: 'iPhone 15 Pro',
      amount: 999.99,
      date: '2025-07-28T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      customer: 'Mike Chen',
      product: 'MacBook Pro 14"',
      amount: 1999.99,
      date: '2025-07-28T09:15:00Z',
      status: 'processing'
    },
    {
      id: '3',
      customer: 'Emily Davis',
      product: 'Sony Headphones',
      amount: 349.99,
      date: '2025-07-28T08:45:00Z',
      status: 'completed'
    },
    {
      id: '4',
      customer: 'David Wilson',
      product: 'Samsung Galaxy S24',
      amount: 899.99,
      date: '2025-07-28T08:20:00Z',
      status: 'shipped'
    },
    {
      id: '5',
      customer: 'Lisa Wang',
      product: 'iPad Pro 12.9"',
      amount: 1099.99,
      date: '2025-07-28T07:55:00Z',
      status: 'completed'
    }
  ],
  topProducts: [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      sales: 234,
      revenue: 233766,
      trend: 'up',
      change: 15.3,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100'
    },
    {
      id: '2',
      name: 'MacBook Pro 14"',
      sales: 89,
      revenue: 177911,
      trend: 'up',
      change: 8.7,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100'
    },
    {
      id: '3',
      name: 'Samsung Galaxy S24',
      sales: 156,
      revenue: 140398,
      trend: 'down',
      change: -3.2,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100'
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5',
      sales: 298,
      revenue: 104293,
      trend: 'up',
      change: 22.1,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100'
    },
    {
      id: '5',
      name: 'iPad Pro 12.9"',
      sales: 67,
      revenue: 73699,
      trend: 'up',
      change: 5.8,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100'
    }
  ],
  customerStats: {
    newCustomers: 89,
    returningCustomers: 156,
    customerRetentionRate: 67.8,
    averageLifetimeValue: 342.56
  },
  trafficSources: [
    { source: 'Organic Search', visitors: 12456, percentage: 42.3, color: 'bg-blue-500' },
    { source: 'Direct', visitors: 8934, percentage: 30.4, color: 'bg-green-500' },
    { source: 'Social Media', visitors: 4567, percentage: 15.5, color: 'bg-purple-500' },
    { source: 'Email', visitors: 2345, percentage: 8.0, color: 'bg-orange-500' },
    { source: 'Referral', visitors: 1123, percentage: 3.8, color: 'bg-pink-500' }
  ]
};

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const renderTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your store's performance and insights</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(analyticsData.overview.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {renderTrendIcon(analyticsData.overview.revenueChange)}
              <span className={`ml-1 ${getChangeColor(analyticsData.overview.revenueChange)}`}>
                {formatChange(analyticsData.overview.revenueChange)}
              </span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {renderTrendIcon(analyticsData.overview.ordersChange)}
              <span className={`ml-1 ${getChangeColor(analyticsData.overview.ordersChange)}`}>
                {formatChange(analyticsData.overview.ordersChange)}
              </span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {renderTrendIcon(analyticsData.overview.customersChange)}
              <span className={`ml-1 ${getChangeColor(analyticsData.overview.customersChange)}`}>
                {formatChange(analyticsData.overview.customersChange)}
              </span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(analyticsData.overview.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {renderTrendIcon(analyticsData.overview.aovChange)}
              <span className={`ml-1 ${getChangeColor(analyticsData.overview.aovChange)}`}>
                {formatChange(analyticsData.overview.aovChange)}
              </span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.conversionRate}%
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {renderTrendIcon(analyticsData.overview.conversionChange)}
              <span className={`ml-1 ${getChangeColor(analyticsData.overview.conversionChange)}`}>
                {formatChange(analyticsData.overview.conversionChange)}
              </span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <LineChart className="h-4 w-4 mr-2" />
                  Revenue
                </Button>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Orders
                </Button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would be rendered here</p>
                <p className="text-sm text-gray-500">Integration with charting library like Chart.js or Recharts</p>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h2>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${source.color}`} />
                    <span className="text-sm text-gray-700">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {source.visitors.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{source.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-center">
                <Button variant="outline" size="sm" className="w-full">
                  <PieChart className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {analyticsData.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sale.customer}</p>
                    <p className="text-sm text-gray-600">{sale.product}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(sale.amount)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      sale.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                  </div>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{product.sales} sales</span>
                      <span>•</span>
                      <span>{formatPrice(product.revenue)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {product.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${getChangeColor(product.change)}`}>
                      {formatChange(product.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.customerStats.newCustomers}
              </div>
              <p className="text-sm text-gray-600 mt-1">New Customers</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.customerStats.returningCustomers}
              </div>
              <p className="text-sm text-gray-600 mt-1">Returning Customers</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analyticsData.customerStats.customerRetentionRate}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Retention Rate</p>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(analyticsData.customerStats.averageLifetimeValue)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Avg Lifetime Value</p>
              <p className="text-xs text-gray-500">Per customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
