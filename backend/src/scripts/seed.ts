import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Category } from '../entities/Category';
import { Product } from '../entities/Product';
import { Order, OrderStatus } from '../entities/Order';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { OrderItem } from '../entities/OrderItem';
import { Address } from '../entities/Address';
import { PasswordUtils } from '../utils/password';

/**
 * Sample data for seeding the database
 */
const SAMPLE_DATA = {
  users: [
    {
      email: 'admin@tfmshop.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+1234567890',
    },
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      phone: '+1234567891',
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.CUSTOMER,
      phone: '+1234567892',
    },
    {
      email: 'bob.wilson@example.com',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: UserRole.CUSTOMER,
      phone: '+1234567893',
    },
  ],

  categories: [
    {
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      slug: 'electronics',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      sortOrder: 1,
    },
    {
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      slug: 'smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      sortOrder: 2,
      parentSlug: 'electronics',
    },
    {
      name: 'Laptops',
      description: 'Portable computers and accessories',
      slug: 'laptops',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      sortOrder: 3,
      parentSlug: 'electronics',
    },
    {
      name: 'Clothing',
      description: 'Fashion and apparel',
      slug: 'clothing',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      sortOrder: 4,
    },
    {
      name: 'Men\'s Clothing',
      description: 'Clothing for men',
      slug: 'mens-clothing',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      sortOrder: 5,
      parentSlug: 'clothing',
    },
    {
      name: 'Women\'s Clothing',
      description: 'Clothing for women',
      slug: 'womens-clothing',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c9c0b8b7?w=500',
      sortOrder: 6,
      parentSlug: 'clothing',
    },
    {
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      slug: 'home-garden',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      sortOrder: 7,
    },
    {
      name: 'Books',
      description: 'Books and educational materials',
      slug: 'books',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      sortOrder: 8,
    },
  ],

  products: [
    // Electronics - Smartphones
    {
      title: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      slug: 'iphone-15-pro',
      price: 999.99,
      originalPrice: 1099.99,
      currency: 'USD',
      stockQuantity: 50,
      sku: 'IPH15PRO001',
      rating: 4.8,
      reviewCount: 245,
      badge: 'New',
      categorySlug: 'smartphones',
      brand: 'Apple',
      weight: 0.187,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      ],
      specifications: {
        display: '6.1-inch Super Retina XDR',
        processor: 'A17 Pro chip',
        storage: '128GB',
        camera: '48MP Main camera',
        battery: 'Up to 23 hours video playback',
      },
      tags: ['smartphone', 'apple', 'ios', 'premium'],
    },
    {
      title: 'Samsung Galaxy S24',
      description: 'Flagship Android smartphone with AI features',
      slug: 'samsung-galaxy-s24',
      price: 799.99,
      currency: 'USD',
      stockQuantity: 75,
      sku: 'SAM24001',
      rating: 4.6,
      reviewCount: 189,
      categorySlug: 'smartphones',
      brand: 'Samsung',
      weight: 0.168,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
      ],
      specifications: {
        display: '6.2-inch Dynamic AMOLED 2X',
        processor: 'Snapdragon 8 Gen 3',
        storage: '256GB',
        camera: '50MP Triple camera',
        battery: '4000mAh',
      },
      tags: ['smartphone', 'samsung', 'android', 'ai'],
    },

    // Electronics - Laptops
    {
      title: 'MacBook Pro 14-inch',
      description: 'Professional laptop with M3 chip for creative professionals',
      slug: 'macbook-pro-14',
      price: 1999.99,
      currency: 'USD',
      stockQuantity: 25,
      sku: 'MBP14M3001',
      rating: 4.9,
      reviewCount: 156,
      badge: 'Pro',
      categorySlug: 'laptops',
      brand: 'Apple',
      weight: 1.6,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      ],
      specifications: {
        display: '14.2-inch Liquid Retina XDR',
        processor: 'Apple M3 chip',
        memory: '16GB unified memory',
        storage: '512GB SSD',
        battery: 'Up to 18 hours',
      },
      tags: ['laptop', 'apple', 'professional', 'creative'],
    },
    {
      title: 'Dell XPS 13',
      description: 'Ultra-portable laptop with premium build quality',
      slug: 'dell-xps-13',
      price: 1299.99,
      originalPrice: 1399.99,
      currency: 'USD',
      stockQuantity: 40,
      sku: 'DELLXPS13001',
      rating: 4.5,
      reviewCount: 203,
      categorySlug: 'laptops',
      brand: 'Dell',
      weight: 1.2,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      ],
      specifications: {
        display: '13.4-inch FHD+',
        processor: 'Intel Core i7-1360P',
        memory: '16GB LPDDR5',
        storage: '512GB SSD',
        battery: 'Up to 12 hours',
      },
      tags: ['laptop', 'dell', 'ultrabook', 'portable'],
    },

    // Clothing - Men's
    {
      title: 'Classic Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear',
      slug: 'classic-cotton-tshirt',
      price: 24.99,
      currency: 'USD',
      stockQuantity: 200,
      sku: 'TSHIRT001',
      rating: 4.3,
      reviewCount: 89,
      categorySlug: 'mens-clothing',
      brand: 'BasicWear',
      weight: 0.2,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      ],
      specifications: {
        material: '100% Cotton',
        fit: 'Regular',
        care: 'Machine washable',
        sizes: 'S, M, L, XL, XXL',
      },
      tags: ['t-shirt', 'cotton', 'casual', 'basic'],
    },
    {
      title: 'Denim Jeans',
      description: 'Classic blue denim jeans with modern fit',
      slug: 'denim-jeans',
      price: 79.99,
      currency: 'USD',
      stockQuantity: 150,
      sku: 'JEANS001',
      rating: 4.4,
      reviewCount: 124,
      categorySlug: 'mens-clothing',
      brand: 'DenimCo',
      weight: 0.6,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      ],
      specifications: {
        material: '98% Cotton, 2% Elastane',
        fit: 'Slim',
        wash: 'Dark blue',
        sizes: '28-38 waist',
      },
      tags: ['jeans', 'denim', 'casual', 'classic'],
    },

    // Books
    {
      title: 'The Art of Programming',
      description: 'Comprehensive guide to software development best practices',
      slug: 'art-of-programming',
      price: 49.99,
      currency: 'USD',
      stockQuantity: 80,
      sku: 'BOOK001',
      rating: 4.7,
      reviewCount: 67,
      categorySlug: 'books',
      brand: 'TechBooks',
      weight: 0.8,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      ],
      specifications: {
        pages: '456',
        format: 'Paperback',
        language: 'English',
        publisher: 'TechBooks Publishing',
        isbn: '978-1234567890',
      },
      tags: ['programming', 'software', 'development', 'technical'],
    },

    // Home & Garden
    {
      title: 'Smart Home Security Camera',
      description: 'WiFi-enabled security camera with night vision',
      slug: 'smart-security-camera',
      price: 129.99,
      originalPrice: 149.99,
      currency: 'USD',
      stockQuantity: 60,
      sku: 'CAM001',
      rating: 4.2,
      reviewCount: 98,
      badge: 'Smart',
      categorySlug: 'home-garden',
      brand: 'SecureHome',
      weight: 0.3,
      weightUnit: 'kg',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      ],
      specifications: {
        resolution: '1080p HD',
        connectivity: 'WiFi 802.11n',
        storage: 'Cloud & SD card',
        features: 'Night vision, Motion detection',
        power: 'AC adapter',
      },
      tags: ['security', 'camera', 'smart-home', 'surveillance'],
    },
  ],

  addresses: [
    {
      userEmail: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Tech Corp',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '+1234567891',
      isDefault: true,
    },
    {
      userEmail: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      addressLine1: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
      phone: '+1234567892',
      isDefault: true,
    },
  ],
};

/**
 * Seed database with sample data
 */
async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await AppDataSource.query('DELETE FROM order_items');
    await AppDataSource.query('DELETE FROM orders');
    await AppDataSource.query('DELETE FROM cart_items');
    await AppDataSource.query('DELETE FROM carts');
    await AppDataSource.query('DELETE FROM addresses');
    await AppDataSource.query('DELETE FROM products');
    await AppDataSource.query('DELETE FROM categories');
    await AppDataSource.query('DELETE FROM users');

    // Reset sequences
    await AppDataSource.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await AppDataSource.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
    await AppDataSource.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

    // Seed users
    console.log('👥 Seeding users...');
    const userRepository = AppDataSource.getRepository(User);
    const users: User[] = [];
    
    for (const userData of SAMPLE_DATA.users) {
      const user = new User();
      user.email = userData.email;
      user.password = await PasswordUtils.hashPassword(userData.password);
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.role = userData.role;
      user.phone = userData.phone;
      
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
      console.log(`  ✅ Created user: ${userData.email}`);
    }

    // Seed categories
    console.log('📂 Seeding categories...');
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories: Category[] = [];
    const categoryMap = new Map<string, Category>();
    
    // First pass: create categories without parents
    for (const categoryData of SAMPLE_DATA.categories.filter(c => !c.parentSlug)) {
      const category = new Category();
      category.name = categoryData.name;
      category.description = categoryData.description;
      category.slug = categoryData.slug;
      category.imageUrl = categoryData.imageUrl;
      category.sortOrder = categoryData.sortOrder;
      
      const savedCategory = await categoryRepository.save(category);
      categories.push(savedCategory);
      categoryMap.set(categoryData.slug, savedCategory);
      console.log(`  ✅ Created category: ${categoryData.name}`);
    }
    
    // Second pass: create categories with parents
    for (const categoryData of SAMPLE_DATA.categories.filter(c => c.parentSlug)) {
      const category = new Category();
      category.name = categoryData.name;
      category.description = categoryData.description;
      category.slug = categoryData.slug;
      category.imageUrl = categoryData.imageUrl;
      category.sortOrder = categoryData.sortOrder;
      category.parent = categoryMap.get(categoryData.parentSlug!);
      
      const savedCategory = await categoryRepository.save(category);
      categories.push(savedCategory);
      categoryMap.set(categoryData.slug, savedCategory);
      console.log(`  ✅ Created subcategory: ${categoryData.name}`);
    }

    // Seed products
    console.log('📦 Seeding products...');
    const productRepository = AppDataSource.getRepository(Product);
    const products: Product[] = [];
    
    for (const productData of SAMPLE_DATA.products) {
      const product = new Product();
      product.title = productData.title;
      product.description = productData.description;
      product.slug = productData.slug;
      product.price = productData.price;
      product.originalPrice = productData.originalPrice;
      product.currency = productData.currency;
      product.stockQuantity = productData.stockQuantity;
      product.sku = productData.sku;
      product.rating = productData.rating;
      product.reviewCount = productData.reviewCount;
      product.badge = productData.badge;
      product.brand = productData.brand;
      product.weight = productData.weight;
      product.weightUnit = productData.weightUnit;
      product.images = productData.images;
      product.specifications = productData.specifications;
      product.tags = productData.tags;
      product.category = categoryMap.get(productData.categorySlug)!;
      product.publishedAt = new Date();
      
      const savedProduct = await productRepository.save(product);
      products.push(savedProduct);
      console.log(`  ✅ Created product: ${productData.title}`);
    }

    // Seed addresses
    console.log('🏠 Seeding addresses...');
    const addressRepository = AppDataSource.getRepository(Address);
    
    for (const addressData of SAMPLE_DATA.addresses) {
      const user = users.find(u => u.email === addressData.userEmail);
      if (user) {
        const address = new Address();
        address.firstName = addressData.firstName;
        address.lastName = addressData.lastName;
        address.company = addressData.company;
        address.addressLine1 = addressData.addressLine1;
        address.addressLine2 = addressData.addressLine2;
        address.city = addressData.city;
        address.state = addressData.state;
        address.postalCode = addressData.postalCode;
        address.country = addressData.country;
        address.phone = addressData.phone;
        address.isDefault = addressData.isDefault;
        address.user = user;
        
        await addressRepository.save(address);
        console.log(`  ✅ Created address for: ${user.email}`);
      }
    }

    // Create sample carts with items
    console.log('🛒 Seeding carts...');
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    
    const customer = users.find(u => u.role === UserRole.CUSTOMER);
    if (customer && products.length > 0) {
      const cart = new Cart();
      cart.user = customer;
      const savedCart = await cartRepository.save(cart);
      
      // Add some items to cart
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const cartItem = new CartItem();
        cartItem.cart = savedCart;
        cartItem.product = products[i];
        cartItem.quantity = Math.floor(Math.random() * 3) + 1;
        cartItem.price = products[i].price;
        
        await cartItemRepository.save(cartItem);
      }
      
      console.log(`  ✅ Created cart for: ${customer.email}`);
    }

    // Create sample orders
    console.log('📋 Seeding orders...');
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    
    const customers = users.filter(u => u.role === UserRole.CUSTOMER);
    for (let i = 0; i < customers.length && i < 3; i++) {
      const customer = customers[i];
      const order = new Order();
      order.orderNumber = `ORD${Date.now()}${i}`;
      order.user = customer;
      order.status = i === 0 ? OrderStatus.DELIVERED : OrderStatus.PENDING;
      order.subtotal = 0;
      order.tax = 0;
      order.shipping = 9.99;
      order.total = 0;
      
      // Sample address
      order.shippingAddress = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        addressLine1: '123 Sample Street',
        city: 'Sample City',
        state: 'SC',
        postalCode: '12345',
        country: 'USA',
      };
      order.billingAddress = order.shippingAddress;
      
      const savedOrder = await orderRepository.save(order);
      
      // Add order items
      let subtotal = 0;
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numItems && j < products.length; j++) {
        const orderItem = new OrderItem();
        orderItem.order = savedOrder;
        orderItem.product = products[j];
        orderItem.quantity = Math.floor(Math.random() * 2) + 1;
        orderItem.unitPrice = products[j].price;
        orderItem.productTitle = products[j].title;
        
        subtotal += orderItem.unitPrice * orderItem.quantity;
        await orderItemRepository.save(orderItem);
      }
      
      // Update order totals
      order.subtotal = subtotal;
      order.tax = subtotal * 0.08; // 8% tax
      order.total = subtotal + order.tax + order.shipping;
      await orderRepository.save(order);
      
      console.log(`  ✅ Created order: ${order.orderNumber} for ${customer.email}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Addresses: ${SAMPLE_DATA.addresses.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all data from database
 */
async function clearDatabase(): Promise<void> {
  console.log('🧹 Clearing database...');

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Clear in reverse order of dependencies
    await AppDataSource.query('DELETE FROM order_items');
    await AppDataSource.query('DELETE FROM orders');
    await AppDataSource.query('DELETE FROM cart_items');
    await AppDataSource.query('DELETE FROM carts');
    await AppDataSource.query('DELETE FROM addresses');
    await AppDataSource.query('DELETE FROM products');
    await AppDataSource.query('DELETE FROM categories');
    await AppDataSource.query('DELETE FROM users');

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Reset database (clear and seed)
 */
async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database...');
  await clearDatabase();
  await seedDatabase();
  console.log('✅ Database reset completed!');
}

/**
 * Seed database with performance test data
 */
async function seedPerformanceData(): Promise<void> {
  console.log('🚀 Seeding performance test data...');

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(Category);
    const userRepository = AppDataSource.getRepository(User);
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);

    // Create additional categories for testing
    const testCategories = [];
    for (let i = 1; i <= 20; i++) {
      const category = new Category();
      category.name = `Test Category ${i}`;
      category.description = `Test category ${i} for performance testing with advanced filtering and search capabilities`;
      category.slug = `test-category-${i}`;
      category.imageUrl = `https://images.unsplash.com/photo-${1500000000000 + i}?w=500`;
      category.sortOrder = 100 + i;
      
      const savedCategory = await categoryRepository.save(category);
      testCategories.push(savedCategory);
    }

    // Create many products for performance testing
    const batchSize = 200; // Increased batch size for better performance
    const totalProducts = 5000; // Increased for better performance testing
    
    const brands = ['TechBrand', 'QualityMaker', 'PremiumCorp', 'ValueLine', 'ProSeries', 'EliteGoods', 'MegaCorp', 'SuperTech', 'UltraMax', 'PowerPlus'];
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Silver', 'Gold', 'Purple', 'Orange'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
    const materials = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Metal', 'Plastic', 'Wood', 'Glass', 'Ceramic'];
    const keywords = ['premium', 'professional', 'advanced', 'smart', 'eco-friendly', 'durable', 'lightweight', 'waterproof', 'wireless', 'portable'];
    
    console.log(`Creating ${totalProducts} products in batches of ${batchSize}...`);
    
    for (let batch = 0; batch < totalProducts / batchSize; batch++) {
      const products = [];
      
      for (let i = 0; i < batchSize; i++) {
        const productIndex = batch * batchSize + i + 1;
        const product = new Product();
        
        const brandIndex = productIndex % brands.length;
        const colorIndex = productIndex % colors.length;
        const keywordIndex = productIndex % keywords.length;
        
        product.title = `${keywords[keywordIndex]} ${brands[brandIndex]} Product ${productIndex} - ${colors[colorIndex]}`;
        product.description = `This is a comprehensive test product ${productIndex} created for performance testing. It includes various features, specifications, and keywords to test search functionality, filtering capabilities, and database query optimization. Features include ${keywords[keywordIndex]} technology and premium ${materials[productIndex % materials.length]} materials. Perfect for testing complex queries and search operations.`;
        product.slug = `performance-test-product-${productIndex}`;
        product.price = Math.round((Math.random() * 2000 + 10) * 100) / 100;
        product.originalPrice = Math.round(product.price * (1.1 + Math.random() * 0.5) * 100) / 100;
        product.currency = 'USD';
        product.stockQuantity = Math.floor(Math.random() * 200) + 1;
        product.sku = `PERF${productIndex.toString().padStart(6, '0')}`;
        product.rating = Math.round((Math.random() * 2 + 3) * 10) / 10;
        product.reviewCount = Math.floor(Math.random() * 1000);
        product.brand = brands[brandIndex];
        product.weight = Math.round((Math.random() * 10 + 0.1) * 100) / 100;
        product.weightUnit = 'kg';
        product.images = [
          `https://images.unsplash.com/photo-${1600000000000 + productIndex}?w=500`,
          `https://images.unsplash.com/photo-${1600000000000 + productIndex + 1000}?w=500`,
          `https://images.unsplash.com/photo-${1600000000000 + productIndex + 2000}?w=500`,
        ];
        product.specifications = {
          color: colors[colorIndex],
          size: sizes[productIndex % sizes.length],
          material: materials[productIndex % materials.length],
          warranty: `${Math.floor(Math.random() * 5) + 1} years`,
          model: `Model-${productIndex}`,
          year: 2020 + (productIndex % 5),
          category: `Category-${Math.floor(productIndex / 100)}`,
          features: [
            keywords[keywordIndex],
            materials[productIndex % materials.length],
            colors[colorIndex],
          ],
        };
        product.tags = [
          'performance-test',
          `batch-${batch}`,
          `price-range-${Math.floor(product.price / 200) * 200}`,
          product.brand.toLowerCase().replace(/\s+/g, '-'),
          colors[colorIndex].toLowerCase(),
          `rating-${Math.floor(product.rating)}`,
          keywords[keywordIndex],
          materials[productIndex % materials.length].toLowerCase(),
          `year-${2020 + (productIndex % 5)}`,
          `stock-${product.stockQuantity > 100 ? 'high' : product.stockQuantity > 50 ? 'medium' : 'low'}`,
        ];
        product.category = testCategories[Math.floor(Math.random() * testCategories.length)];
        product.publishedAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        
        // Add badges with different probabilities
        const badgeRandom = Math.random();
        if (badgeRandom < 0.05) {
          product.badge = 'Featured';
        } else if (badgeRandom < 0.15) {
          product.badge = 'Sale';
        } else if (badgeRandom < 0.20) {
          product.badge = 'New';
        } else if (badgeRandom < 0.25) {
          product.badge = 'Popular';
        }
        
        products.push(product);
      }
      
      // Save batch with transaction for better performance
      await AppDataSource.transaction(async manager => {
        await manager.save(Product, products);
      });
      
      console.log(`  ✅ Created batch ${batch + 1}/${Math.ceil(totalProducts / batchSize)} (${products.length} products)`);
    }

    // Create additional test users with more realistic data
    console.log('Creating test users...');
    const testUsers = [];
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    for (let i = 1; i <= 500; i++) {
      const user = new User();
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const domain = domains[i % domains.length];
      
      user.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domain}`;
      user.password = await PasswordUtils.hashPassword('password123');
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = i <= 10 ? UserRole.ADMIN : UserRole.CUSTOMER; // First 10 are admins
      user.phone = `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
      
      testUsers.push(user);
    }
    
    // Save users in batches
    const userBatchSize = 100;
    for (let i = 0; i < testUsers.length; i += userBatchSize) {
      const batch = testUsers.slice(i, i + userBatchSize);
      await userRepository.save(batch);
      console.log(`  ✅ Created user batch ${Math.floor(i / userBatchSize) + 1}/${Math.ceil(testUsers.length / userBatchSize)}`);
    }

    // Create test orders for performance testing
    console.log('Creating test orders...');
    const customers = testUsers.filter(u => u.role === UserRole.CUSTOMER);
    const products = await productRepository.find({ take: 1000 }); // Get first 1000 products
    
    const orderStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    
    for (let i = 0; i < 1000; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const order = new Order();
      
      order.orderNumber = `PERF${Date.now()}${i.toString().padStart(4, '0')}`;
      order.user = customer;
      order.status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      order.subtotal = 0;
      order.tax = 0;
      order.shipping = Math.random() < 0.5 ? 0 : 9.99; // 50% free shipping
      order.total = 0;
      
      // Sample address
      order.shippingAddress = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        addressLine1: `${Math.floor(Math.random() * 9999) + 1} Test Street`,
        city: 'Test City',
        state: 'TC',
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'USA',
      };
      order.billingAddress = order.shippingAddress;
      
      const savedOrder = await orderRepository.save(order);
      
      // Add 1-5 order items
      const itemCount = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const orderItem = new OrderItem();
        
        orderItem.order = savedOrder;
        orderItem.product = product;
        orderItem.quantity = Math.floor(Math.random() * 3) + 1;
        orderItem.unitPrice = product.price;
        orderItem.productTitle = product.title;
        
        subtotal += orderItem.unitPrice * orderItem.quantity;
        await orderItemRepository.save(orderItem);
      }
      
      // Update order totals
      order.subtotal = subtotal;
      order.tax = subtotal * 0.08; // 8% tax
      order.total = subtotal + order.tax + order.shipping;
      await orderRepository.save(order);
      
      if ((i + 1) % 100 === 0) {
        console.log(`  ✅ Created ${i + 1}/1000 test orders`);
      }
    }

    console.log('✅ Performance test data seeding completed!');
    console.log(`📊 Total test data:`);
    console.log(`  - Categories: ${testCategories.length}`);
    console.log(`  - Products: ${totalProducts}`);
    console.log(`  - Users: ${testUsers.length}`);
    console.log(`  - Orders: 1000`);

  } catch (error) {
    console.error('❌ Error seeding performance data:', error);
    throw error;
  }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await resetDatabase();
        break;
      case 'performance':
        await seedPerformanceData();
        break;
      case 'full':
        await resetDatabase();
        await seedPerformanceData();
        break;
      default:
        console.log('Usage: npm run seed [seed|clear|reset|performance|full]');
        console.log('  seed        - Add sample data to database');
        console.log('  clear       - Remove all data from database');
        console.log('  reset       - Clear and then seed database');
        console.log('  performance - Add performance test data (1000+ products)');
        console.log('  full        - Reset database and add all data including performance data');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}