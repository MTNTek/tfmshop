import React from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  'Electronics',
  'Books',
  'Home & Garden',
  'Sports & Outdoors',
  'Fashion',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Music',
  'Movies & TV'
];

const CategoryNav = () => {
  return (
    <nav className="bg-[#001f14] border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center space-x-1 py-2 overflow-x-auto">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant="ghost"
              className="text-white hover:bg-[#000f0a] whitespace-nowrap text-[14px] px-3 py-1"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;