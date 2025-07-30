import { db } from './index'
import { categories, products, users } from './schema'

// Sample categories data compatible with schema
const sampleCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronic devices and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel for all occasions',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books for all interests and ages',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    isActive: true,
    sortOrder: 4,
  }
]

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Insert categories first
    console.log('📂 Inserting categories...')
    const insertedCategories = await db.insert(categories).values(sampleCategories).returning()
    console.log(`✅ Inserted ${insertedCategories.length} categories`)

    // Sample products data compatible with schema
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced camera system and A17 Pro chip',
        shortDescription: 'Latest iPhone with advanced features',
        sku: 'IPH15P-128-TIT',
        price: '999.00',
        comparePrice: '1099.00',
        currency: 'USD',
        categoryId: insertedCategories[0].id, // Electronics
        brand: 'Apple',
        stock: 50,
        isActive: true,
        isFeatured: true,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
          'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400'
        ]),
        tags: JSON.stringify(['smartphone', 'apple', 'premium', 'featured']),
        seoTitle: 'iPhone 15 Pro - Latest Apple Smartphone',
        seoDescription: 'Get the latest iPhone 15 Pro with advanced camera and A17 Pro chip',
      },
      {
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Comfortable running shoes with Max Air unit for superior cushioning',
        shortDescription: 'Premium running shoes',
        sku: 'NIKE-AM270-BLK-10',
        price: '150.00',
        currency: 'USD',
        categoryId: insertedCategories[1].id, // Clothing
        brand: 'Nike',
        stock: 25,
        isActive: true,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
        ]),
        variants: JSON.stringify({
          sizes: ['8', '9', '10', '11', '12'],
          colors: ['Black', 'White', 'Blue']
        }),
        tags: JSON.stringify(['shoes', 'nike', 'running', 'sports']),
      }
    ]

    // Insert products
    console.log('📦 Inserting products...')
    await db.insert(products).values(sampleProducts)
    console.log(`✅ Inserted ${sampleProducts.length} products`)

    // Create a sample admin user
    console.log('👤 Creating sample admin user...')
    await db.insert(users).values({
      email: 'admin@tfmshop.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHSBd.E8m5X8Zr7i', // 'password123'
      role: 'admin',
      isEmailVerified: true,
    })
    console.log('✅ Created admin user')

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seed script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error)
      process.exit(1)
    })
}

export default seed
