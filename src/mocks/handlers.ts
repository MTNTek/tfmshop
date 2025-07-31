// MSW (Mock Service Worker) request handlers for testing with MSW v2
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock user API
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    })
  }),

  // Mock products API
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        description: 'Test product description',
        image: '/test-product.jpg'
      }
    ])
  }),

  // Mock cart API
  http.get('/api/cart', () => {
    return HttpResponse.json({
      items: [],
      total: 0
    })
  }),

  // Mock authentication
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      token: 'mock-jwt-token'
    })
  })
]
