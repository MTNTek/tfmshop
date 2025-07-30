import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { CategoryShowcase } from '@/components/sections/category-showcase'
import { NewsletterSection } from '@/components/sections/newsletter-section'
import { ProductGridSkeleton } from '@/components/ui/skeletons'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Products */}
      <section className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover our handpicked selection of premium products
          </p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Category Showcase */}
      <section className="gradient-bg py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore our wide range of product categories
            </p>
          </div>
          <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="loading-skeleton h-32 rounded-lg" />
            ))}
          </div>}>
            <CategoryShowcase />
          </Suspense>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  )
}