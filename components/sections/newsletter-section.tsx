'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { isValidEmail } from '@/lib/utils'
import { toast } from 'sonner'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      setEmail('')
      toast.success('Successfully subscribed to our newsletter!')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="container">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              You've successfully subscribed to our newsletter. 
              We'll keep you updated with the latest deals and products.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="container">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Stay in the Loop
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter and be the first to know about new products, 
              exclusive deals, and special offers. No spam, just great content!
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="sm:w-auto"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>{' '}
              and consent to receive updates from our company.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}