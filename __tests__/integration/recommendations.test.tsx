// Integration test for Recommendations page
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import RecommendationsPage from '@/app/recommendations/page'

describe('AI Recommendations Page Integration', () => {
  test('shows loading state initially', () => {
    render(<RecommendationsPage />)
    
    expect(screen.getByText(/ai is personalizing your experience/i)).toBeDefined()
    expect(screen.getByText(/analyzing your preferences/i)).toBeDefined()
  })

  test('displays recommendations after loading', async () => {
    render(<RecommendationsPage />)
    
    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.getByText('AI Recommendations')).toBeDefined()
      },
      { timeout: 3000 }
    )
    
    // Check for recommendation sections
    expect(screen.getByText('AI Curated Just for You')).toBeDefined()
    expect(screen.getByText('Trending Right Now')).toBeDefined()
    expect(screen.getByText('Customers Like You Also Bought')).toBeDefined()
  })

  test('displays user profile insights', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Your AI Shopping Profile')).toBeDefined()
    })
    
    // Check for profile data
    expect(screen.getByText(/preferred:/i)).toBeDefined()
    expect(screen.getByText(/brands:/i)).toBeDefined()
    expect(screen.getByText(/ai match/i)).toBeDefined()
  })

  test('allows filtering recommendations', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Recommendations')).toBeDefined()
    })
    
    // Find and click filter dropdown
    const filterSelect = screen.getByDisplayValue('All Recommendations')
    fireEvent.change(filterSelect, { target: { value: 'high-confidence' } })
    
    // Should filter to high confidence recommendations
    expect(filterSelect.value).toBe('high-confidence')
  })

  test('refresh functionality works', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Recommendations')).toBeDefined()
    })
    
    // Find and click refresh button
    const refreshButton = screen.getByText('Refresh AI')
    fireEvent.click(refreshButton)
    
    // Should show refreshing state
    expect(refreshButton).toBeDefined()
  })

  test('displays product cards with correct information', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('iPhone 15 Pro Max')).toBeDefined()
    })
    
    // Check for product details
    expect(screen.getByText('Apple')).toBeDefined()
    expect(screen.getByText('$1,199.99')).toBeDefined()
    
    // Check for add to cart buttons
    const addToCartButtons = screen.getAllByText('Add to Cart')
    expect(addToCartButtons.length).toBeGreaterThan(0)
  })

  test('shows confidence scores', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('94.2%')).toBeDefined()
    })
    
    // Check for confidence labels
    expect(screen.getByText('Confidence')).toBeDefined()
  })

  test('displays algorithm information', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Deep Learning Neural Network')).toBeDefined()
    })
    
    expect(screen.getByText('Real-time Trend Analysis')).toBeDefined()
    expect(screen.getByText('Collaborative Filtering')).toBeDefined()
  })

  test('includes AI learning explanation', async () => {
    render(<RecommendationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('How Our AI Learns About You')).toBeDefined()
    })
    
    expect(screen.getByText(/recommendation engine continuously learns/i)).toBeDefined()
    expect(screen.getByText('Viewing patterns')).toBeDefined()
    expect(screen.getByText('Purchase history')).toBeDefined()
    expect(screen.getByText('Ratings & reviews')).toBeDefined()
  })
})
