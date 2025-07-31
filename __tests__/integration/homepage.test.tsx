// Integration test for Homepage
import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

describe('Homepage Integration', () => {
  test('renders homepage with key sections', async () => {
    render(<Home />)
    
    // Check for hero section
    expect(screen.getByText(/discover amazing products/i)).toBeInTheDocument()
    
    // Check for featured categories
    await waitFor(() => {
      expect(screen.getByText(/featured categories/i)).toBeInTheDocument()
    })
    
    // Check for trending products section
    await waitFor(() => {
      expect(screen.getByText(/trending products/i)).toBeInTheDocument()
    })
  })

  test('displays product cards with correct information', async () => {
    render(<Home />)
    
    await waitFor(() => {
      // Should show product names
      expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument()
      expect(screen.getByText('MacBook Pro 14-inch M3')).toBeInTheDocument()
    })
    
    // Should show prices
    expect(screen.getByText('$1,199.99')).toBeInTheDocument()
    
    // Should show ratings
    expect(screen.getAllByText('4.8').length).toBeGreaterThan(0)
  })

  test('renders navigation and footer', () => {
    render(<Home />)
    
    // Check for main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Check for search functionality
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    
    // Check for cart icon
    expect(screen.getByLabelText(/shopping cart/i)).toBeInTheDocument()
  })

  test('displays call-to-action buttons', () => {
    render(<Home />)
    
    // Should have "Shop Now" buttons
    expect(screen.getAllByText(/shop now/i).length).toBeGreaterThan(0)
    
    // Should have "View All" links
    expect(screen.getAllByText(/view all/i).length).toBeGreaterThan(0)
  })

  test('shows promotional banners', async () => {
    render(<Home />)
    
    await waitFor(() => {
      // Check for promotional content
      expect(screen.getByText(/special offers/i)).toBeInTheDocument()
    })
  })

  test('has proper accessibility attributes', () => {
    render(<Home />)
    
    // Check for proper headings hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    
    // Check for alt text on images
    const images = screen.getAllByRole('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('alt')
    })
    
    // Check for semantic navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
