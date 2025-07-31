// Unit test for formatPrice utility function
import { formatPrice } from '@/lib/utils'

describe('formatPrice utility', () => {
  test('formats standard prices correctly', () => {
    expect(formatPrice(99.99)).toBe('$99.99')
    expect(formatPrice(1234.56)).toBe('$1,234.56')
    expect(formatPrice(0)).toBe('$0.00')
  })

  test('handles large numbers', () => {
    expect(formatPrice(1000000)).toBe('$1,000,000.00')
    expect(formatPrice(999999.99)).toBe('$999,999.99')
  })

  test('handles decimal precision', () => {
    expect(formatPrice(9.9)).toBe('$9.90')
    expect(formatPrice(9.999)).toBe('$10.00')
    expect(formatPrice(9.994)).toBe('$9.99')
  })

  test('handles negative numbers', () => {
    expect(formatPrice(-99.99)).toBe('-$99.99')
    expect(formatPrice(-0.01)).toBe('-$0.01')
  })

  test('handles edge cases', () => {
    expect(formatPrice(0.01)).toBe('$0.01')
    expect(formatPrice(0.001)).toBe('$0.00')
    expect(formatPrice(Number.MAX_SAFE_INTEGER)).toContain('$')
  })
})
