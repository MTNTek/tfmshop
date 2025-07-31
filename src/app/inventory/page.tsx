'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Plus,
  Truck,
  Clock,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  image: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  salesVelocity: number; // units per day
  daysOfStock: number;
  incomingShipment?: {
    quantity: number;
    expectedDate: string;
    supplier: string;
  };
}

const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    sku: 'APL-IP15PM-256-TI',
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    currentStock: 45,
    minStock: 20,
    maxStock: 200,
    reorderPoint: 30,
    costPrice: 850.00,
    sellingPrice: 1199.99,
    supplier: 'Apple Inc.',
    lastRestocked: '2025-07-20',
    status: 'in-stock',
    salesVelocity: 3.2,
    daysOfStock: 14,
    incomingShipment: {
      quantity: 50,
      expectedDate: '2025-08-02',
      supplier: 'Apple Inc.'
    }
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-GS24U-512-BK',
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100',
    currentStock: 12,
    minStock: 15,
    maxStock: 150,
    reorderPoint: 25,
    costPrice: 750.00,
    sellingPrice: 1099.99,
    supplier: 'Samsung Electronics',
    lastRestocked: '2025-07-15',
    status: 'low-stock',
    salesVelocity: 2.1,
    daysOfStock: 6,
    incomingShipment: {
      quantity: 30,
      expectedDate: '2025-07-30',
      supplier: 'Samsung Electronics'
    }
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    sku: 'SNY-WH1000XM5-BK',
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    reorderPoint: 15,
    costPrice: 280.00,
    sellingPrice: 349.99,
    supplier: 'Sony Corporation',
    lastRestocked: '2025-07-10',
    status: 'out-of-stock',
    salesVelocity: 4.5,
    daysOfStock: 0,
    incomingShipment: {
      quantity: 25,
      expectedDate: '2025-07-29',
      supplier: 'Sony Corporation'
    }
  },
  {
    id: '4',
    name: 'MacBook Pro 14-inch',
    sku: 'APL-MBP14-M3-SG',
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
    currentStock: 28,
    minStock: 8,
    maxStock: 80,
    reorderPoint: 12,
    costPrice: 1650.00,
    sellingPrice: 1999.99,
    supplier: 'Apple Inc.',
    lastRestocked: '2025-07-22',
    status: 'in-stock',
    salesVelocity: 1.8,
    daysOfStock: 16,
  },
  {
    id: '5',
    name: 'Dell XPS 13 Plus',
    sku: 'DEL-XPS13P-I7-PT',
    category: 'Electronics',
    brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100',
    currentStock: 156,
    minStock: 20,
    maxStock: 60,
    reorderPoint: 30,
    costPrice: 1100.00,
    sellingPrice: 1299.99,
    supplier: 'Dell Technologies',
    lastRestocked: '2025-07-25',
    status: 'overstocked',
    salesVelocity: 0.8,
    daysOfStock: 195,
  }
];

const categoryFilters = ['All Categories', 'Electronics', 'Fashion', 'Home & Garden', 'Books'];
const statusFilters = ['All Status', 'In Stock', 'Low Stock', 'Out of Stock', 'Overstocked'];

export default function InventoryTrackingPage() {
  const [inventory, setInventory] = useState(inventoryData);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(false);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'All Status' || 
                         (statusFilter === 'In Stock' && item.status === 'in-stock') ||
                         (statusFilter === 'Low Stock' && item.status === 'low-stock') ||
                         (statusFilter === 'Out of Stock' && item.status === 'out-of-stock') ||
                         (statusFilter === 'Overstocked' && item.status === 'overstocked');

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'stock-low':
        return a.currentStock - b.currentStock;
      case 'stock-high':
        return b.currentStock - a.currentStock;
      case 'velocity':
        return b.salesVelocity - a.salesVelocity;
      case 'days-of-stock':
        return a.daysOfStock - b.daysOfStock;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low-stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'out-of-stock':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'overstocked':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    return Math.min(percentage, 100);
  };

  const getStockLevelColor = (item: InventoryItem) => {
    if (item.status === 'out-of-stock') return 'bg-red-500';
    if (item.status === 'low-stock') return 'bg-yellow-500';
    if (item.status === 'overstocked') return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const totalItems = inventory.length;
  const inStockItems = inventory.filter(item => item.status === 'in-stock').length;
  const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;
  const overstockedItems = inventory.filter(item => item.status === 'overstocked').length;

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Real-time inventory tracking and management</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inStockItems}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overstocked</p>
                <p className="text-2xl font-bold text-blue-600">{overstockedItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categoryFilters.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {statusFilters.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="name">Sort by Name</option>
                <option value="stock-low">Stock: Low to High</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="velocity">Sales Velocity</option>
                <option value="days-of-stock">Days of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Items ({filteredInventory.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Velocity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days of Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{item.sku}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.currentStock}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${getStockLevelColor(item)}`}
                          style={{ width: `${getStockLevel(item)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.salesVelocity.toFixed(1)} /day</div>
                      <div className="flex items-center space-x-1">
                        {item.salesVelocity > 2 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${item.salesVelocity > 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.salesVelocity > 2 ? 'High' : 'Low'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.daysOfStock > 0 ? `${item.daysOfStock} days` : 'Out of stock'}
                      </div>
                      {item.incomingShipment && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Truck className="h-3 w-3" />
                          <span>+{item.incomingShipment.quantity} incoming</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.currentStock * item.costPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cost: {formatPrice(item.costPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                          disabled={item.status !== 'low-stock' && item.status !== 'out-of-stock'}
                        >
                          <Package className="h-3 w-3" />
                          <span>Reorder</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
