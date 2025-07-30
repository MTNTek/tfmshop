import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ProductCard } from '@/components/ui/product-card'

// Mock data - in real app this would come from database
const categories = {
  'electronics': {
    id: '1',
    name: 'Electronics',
    description: 'Latest electronic devices and gadgets for your digital lifestyle',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
    products: [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: '999.00',
        comparePrice: '1099.00',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        rating: 4.5,
        reviewCount: 1247,
        brand: 'Apple',
        isPrime: true,
        isBestSeller: true,
      },
      {
        id: '3',
        name: 'MacBook Pro 14"',
        slug: 'macbook-pro-14',
        price: '1999.00',
        comparePrice: '2199.00',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        rating: 4.8,
        reviewCount: 567,
        brand: 'Apple',
        isPrime: true,
      },
      {
        id: '4',
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        price: '399.00',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        rating: 4.6,
        reviewCount: 1834,
        brand: 'Sony',
        isPrime: true,
      },
      {
        id: '5',
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        price: '1199.00',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
        rating: 4.4,
        reviewCount: 892,
        brand: 'Samsung',
        isPrime: true,
      },
      {
        id: '6',
        name: 'iPad Pro 12.9"',
        slug: 'ipad-pro-12-9',
        price: '1099.00',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        rating: 4.7,
        reviewCount: 634,
        brand: 'Apple',
        isPrime: true,
      },
      {
        id: '7',
        name: 'AirPods Pro 2',
        slug: 'airpods-pro-2',
        price: '249.00',
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        rating: 4.3,
        reviewCount: 2156,
        brand: 'Apple',
        isPrime: true,
      },
    ]
  },
  'clothing': {
    id: '2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories for every style and occasion',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    products: [
      {
        id: '2',
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        price: '150.00',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        rating: 4.3,
        reviewCount: 892,
        brand: 'Nike',
        isPrime: true,
      }
    ]
  },
  'home-garden': {
    id: '3',
    name: 'Home & Garden',
    description: 'Everything you need to make your house a home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
    products: []
  },
  'books': {
    id: '4',
    name: 'Books',
    description: 'Discover your next great read',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
    products: []
  }
}

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categories[params.slug as keyof typeof categories]

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero */}
      <div className="relative h-48 md:h-64">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-3xl px-4">
            <h1 className="mb-4 text-3xl font-bold md:text-5xl">
              {category.name}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {category.products.length} results
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <select className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-amazon-orange focus:outline-none">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Reviews</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {category.products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mb-4 text-6xl">📦</div>
              <h3 className="mb-2 text-xl font-semibold">No products yet</h3>
              <p className="text-gray-600">
                We're working on adding products to this category. Check back soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata({ params }: CategoryPageProps) {
  const category = categories[params.slug as keyof typeof categories]

  if (!category) {
    return {
      title: 'Category Not Found - TFMshop',
    }
  }

  return {
    title: `${category.name} - TFMshop`,
    description: category.description,
  }
}
