import Link from 'next/link'
import { ShoppingBag, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto mb-8 h-64 w-64">
          <ShoppingBag className="h-full w-full text-gray-300" />
        </div>
        
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Page Not Found
        </h1>
        
        <p className="mb-8 text-lg text-gray-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          The product may have been moved or is no longer available.
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
          <Link href="/">
            <Button variant="amazon" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          
          <Link href="/search">
            <Button variant="outline" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Search Products
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Popular Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/category/electronics" 
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Electronics
            </Link>
            <Link 
              href="/category/fashion" 
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Fashion
            </Link>
            <Link 
              href="/category/home-garden" 
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Home & Garden
            </Link>
            <Link 
              href="/category/books" 
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
