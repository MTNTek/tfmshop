import { Suspense } from 'react'
import { ProductCard } from '@/components/ui/product-card'

// Mock search results - in real app this would come from database search
const searchResults = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999.00,
    comparePrice: 1099.00,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.5,
    reviewCount: 1247,
    isPrime: true,
    href: '/product/iphone-15-pro'
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    price: 899.00,
    image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400',
    rating: 4.3,
    reviewCount: 892,
    isPrime: true,
    href: '/product/samsung-galaxy-s24'
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    brand: 'Apple',
    price: 1299.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    rating: 4.6,
    reviewCount: 567,
    isPrime: true,
    href: '/product/macbook-air-m3'
  }
]

interface SearchPageProps {
  searchParams: {
    q?: string
    category?: string
  }
}

function SearchResults({ query, category }: { query?: string; category?: string }) {
  // Filter results based on search query and category
  let filteredResults = searchResults

  if (query) {
    filteredResults = filteredResults.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    )
  }

  if (category && category !== 'All') {
    // In a real app, you'd filter by actual category data
    filteredResults = filteredResults.filter(product => 
      category.toLowerCase() === 'electronics' ? 
        ['Apple', 'Samsung'].includes(product.brand) : 
        true
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            {category && category !== 'All' && ` in ${category}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amazon-orange focus:outline-none">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Customer Reviews</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">No results found</h2>
          <p className="mt-2 text-gray-600">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResults.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              slug={product.href.split('/').pop() || ''}
              price={product.price.toString()}
              comparePrice={product.comparePrice?.toString()}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              brand={product.brand}
              isPrime={product.isPrime}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query, category } = searchParams

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Filters sidebar could go here */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Department</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Electronics</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Computers</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Cell Phones</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Price</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Under $100</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">$100 to $500</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">$500 to $1000</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">$1000 & Above</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Brand</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Apple</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Samsung</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">Sony</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Customer Reviews</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">4 Stars & Up</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    <span className="text-sm">3 Stars & Up</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading search results...</div>}>
              <SearchResults query={query} category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export function generateMetadata({ searchParams }: SearchPageProps) {
  const { q: query } = searchParams
  
  return {
    title: query ? `"${query}" - Search Results | TFMshop` : 'Search Results | TFMshop',
    description: query ? `Search results for "${query}" on TFMshop` : 'Browse our complete product catalog',
  }
}
