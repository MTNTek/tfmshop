import React from 'react';
import ProductCard from './ProductCard';

const products = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Wireless Bluetooth Headphones with Noise Cancellation',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviewCount: 1245,
    badge: 'Best Seller',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=400',
    title: 'Smartphone Case with Wireless Charging Support',
    price: 24.99,
    rating: 4.2,
    reviewCount: 823,
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Professional Camera Lens 50mm f/1.8',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.8,
    reviewCount: 567,
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Modern LED Desk Lamp with USB Charging Port',
    price: 45.99,
    rating: 4.3,
    reviewCount: 432,
  },
  {
    id: 5,
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Wireless Gaming Mouse with RGB Lighting',
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviewCount: 1089,
    badge: 'Gaming Choice',
  },
  {
    id: 6,
    image: 'https://images.pexels.com/photos/1029771/pexels-photo-1029771.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Stainless Steel Water Bottle 32oz',
    price: 29.99,
    rating: 4.4,
    reviewCount: 756,
  },
  {
    id: 7,
    image: 'https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Premium Coffee Beans 2lb Bag - Dark Roast',
    price: 18.99,
    rating: 4.7,
    reviewCount: 2134,
  },
  {
    id: 8,
    image: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Ergonomic Office Chair with Lumbar Support',
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.1,
    reviewCount: 343,
  },
  {
    id: 9,
    image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Yoga Mat with Carrying Strap - Extra Thick',
    price: 34.99,
    rating: 4.5,
    reviewCount: 987,
  },
  {
    id: 10,
    image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Bluetooth Portable Speaker - Waterproof',
    price: 39.99,
    originalPrice: 59.99,
    rating: 4.3,
    reviewCount: 612,
  },
  {
    id: 11,
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Professional Kitchen Knife Set with Block',
    price: 129.99,
    rating: 4.6,
    reviewCount: 445,
  },
  {
    id: 12,
    image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Electric Toothbrush with 3 Brush Heads',
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.4,
    reviewCount: 1567,
    badge: 'Health Choice',
  },
];

const ProductGrid = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;