// Performance optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure function execution time
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    return fn().finally(() => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    })
  }

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  getMetrics(name?: string) {
    if (name) {
      const values = this.metrics.get(name) || []
      return {
        name,
        count: values.length,
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        latest: values[values.length - 1] || 0,
      }
    }
    
    const result: Record<string, any> = {}
    for (const [key] of this.metrics) {
      result[key] = this.getMetrics(key)
    }
    return result
  }

  clear(): void {
    this.metrics.clear()
  }
}

// Image optimization helper
export const optimizeImage = (src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}) => {
  const { width = 800, height, quality = 80, format = 'webp' } = options
  
  // For external images (Unsplash, etc.), add optimization parameters
  if (src.includes('unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    if (height) url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('fm', format)
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('auto', 'format')
    return url.toString()
  }
  
  // For other external images
  if (src.startsWith('http')) {
    return src
  }
  
  // For internal images, use Next.js optimization
  return src
}

// Lazy loading hook
export const useLazyLoad = () => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const observe = useCallback((element: HTMLElement, callback: () => void) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback()
              observerRef.current?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '50px' }
      )
    }
    
    observerRef.current.observe(element)
  }, [])
  
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])
  
  return { observe }
}

// Debounce hook for search and other inputs
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Local storage with expiration
export class StorageManager {
  static setItem(key: string, value: any, expirationMinutes?: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null,
      }
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)
      
      // Check expiration
      if (item.expiration && Date.now() > item.expiration) {
        localStorage.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

// API cache manager
export class ApiCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set(key: string, data: any, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    })
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  static clear(): void {
    this.cache.clear()
  }

  static delete(key: string): void {
    this.cache.delete(key)
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'
