import { test, expect } from '@playwright/test'

test.describe('TFM Shop Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads homepage successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/TFM Shop/i)
    
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Check for hero section
    await expect(page.getByText(/discover amazing products/i)).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    // Test navigation to different pages
    await page.click('text=Categories')
    await expect(page.url()).toContain('/category')
    
    // Go back to home
    await page.goto('/')
    
    // Test cart navigation
    await page.click('[aria-label="Shopping cart"]')
    await expect(page.url()).toContain('/cart')
  })

  test('search functionality works', async ({ page }) => {
    // Test search
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('iPhone')
    await searchInput.press('Enter')
    
    // Should navigate to search results
    await expect(page.url()).toContain('/search')
    await expect(page.getByText('iPhone')).toBeVisible()
  })

  test('product cards are interactive', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await firstProduct.click()
    
    // Should navigate to product page
    await expect(page.url()).toContain('/product/')
  })

  test('responsive design works', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Check if mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    // Check if layout adapts
    await expect(page.locator('nav')).toBeVisible()
  })

  test('footer links work', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()
    
    // Test footer navigation
    await page.click('text=About Us')
    await expect(page.url()).toContain('/about')
    
    // Go back and test another link
    await page.goto('/')
    await page.locator('footer').scrollIntoViewIfNeeded()
    await page.click('text=Contact')
    await expect(page.url()).toContain('/contact')
  })

  test('page performance is acceptable', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    // Load the page
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })
})
