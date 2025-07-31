'use client'

import Link from 'next/link'
import { Search, Phone, MessageCircle, Mail, FileText, Truck, RefreshCw, CreditCard, Shield, Users, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const helpCategories = [
  {
    id: 'orders',
    title: 'Orders & Shipping',
    icon: Truck,
    topics: [
      'Track your package',
      'Delivery options',
      'Change or cancel orders',
      'Order issues',
      'Shipping rates & policies'
    ]
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    icon: RefreshCw,
    topics: [
      'Return an item',
      'Refund status',
      'Return policies',
      'Exchange products',
      'Damaged items'
    ]
  },
  {
    id: 'payment',
    title: 'Payment & Pricing',
    icon: CreditCard,
    topics: [
      'Payment methods',
      'Billing issues',
      'Gift cards',
      'Promotional codes',
      'Price matching'
    ]
  },
  {
    id: 'account',
    title: 'Your Account',
    icon: Users,
    topics: [
      'Sign in problems',
      'Update account info',
      'Privacy settings',
      'Close account',
      'Prime membership'
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    topics: [
      'Account security',
      'Two-factor authentication',
      'Privacy controls',
      'Report suspicious activity',
      'Data protection'
    ]
  },
  {
    id: 'devices',
    title: 'Digital Services',
    icon: FileText,
    topics: [
      'Device support',
      'App issues',
      'Digital downloads',
      'Subscription management',
      'Technical support'
    ]
  }
]

const quickActions = [
  {
    title: 'Track a Package',
    description: 'Get real-time updates on your order',
    icon: Truck,
    action: 'Track Now',
    href: '/track'
  },
  {
    title: 'Return an Item',
    description: 'Start a return or exchange',
    icon: RefreshCw,
    action: 'Start Return',
    href: '/returns'
  },
  {
    title: 'Contact Us',
    description: 'Chat with customer service',
    icon: MessageCircle,
    action: 'Chat Now',
    href: '/contact'
  },
  {
    title: 'Report an Issue',
    description: 'Get help with order problems',
    icon: FileText,
    action: 'Report Issue',
    href: '/report'
  }
]

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    topic: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitted(true)
    setIsSubmitting(false)
    setShowContactForm(false)
  }

  const contactTopics = [
    { value: 'order-tracking', label: 'Order Tracking' },
    { value: 'returns', label: 'Returns & Exchanges' },
    { value: 'shipping', label: 'Shipping Information' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'product-info', label: 'Product Information' },
    { value: 'account', label: 'Account Issues' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'other', label: 'Other' }
  ]
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-tfm-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">Help & Customer Service</h1>
            <p className="mb-8 text-xl opacity-90">
              We&apos;re here to help you find what you need
            </p>
            
            {/* Search */}
            <div className="mx-auto max-w-2xl">
              <div className="flex">
                <Input
                  type="search"
                  placeholder="Search help topics..."
                  className="flex-1 rounded-r-none border-0 bg-white text-gray-900"
                />
                <Button variant="amazon" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Contact Options */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Get Help Now</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Phone Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#06303E] rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Speak directly with our customer service team.
              </p>
              <div className="space-y-2">
                <p className="text-[#06303E] font-semibold">1-800-TFM-SHOP</p>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>Mon-Fri: 9AM-8PM EST</span>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#06303E] rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Chat with us in real-time for quick answers.
              </p>
              <Button className="w-full bg-[#06303E] hover:bg-[#06303E]/90">
                Start Chat
              </Button>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#06303E] rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Send us an email and we'll respond within 24 hours.
              </p>
              <Button 
                onClick={() => setShowContactForm(true)}
                className="w-full bg-[#06303E] hover:bg-[#06303E]/90"
              >
                Send Message
              </Button>
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#06303E] rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Track Order</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Get real-time updates on your order status.
              </p>
              <Link href="/track">
                <Button className="w-full bg-[#06303E] hover:bg-[#06303E]/90">
                  Track Package
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              {submitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false)
                      setShowContactForm(false)
                      setContactForm({ name: '', email: '', topic: '', message: '' })
                    }}
                    className="w-full bg-[#06303E] hover:bg-[#06303E]/90"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Contact Support</h3>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topic *
                      </label>
                      <select
                        value={contactForm.topic}
                        onChange={(e) => setContactForm(prev => ({ ...prev, topic: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06303E] focus:border-transparent"
                      >
                        <option value="">Select a topic</option>
                        {contactTopics.map((topic) => (
                          <option key={topic.value} value={topic.value}>
                            {topic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06303E] focus:border-transparent resize-none"
                        placeholder="Please describe your question or concern..."
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-[#06303E] hover:bg-[#06303E]/90"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <action.icon className="mb-4 h-8 w-8 text-amazon-orange" />
                  <h3 className="mb-2 font-semibold text-gray-900">{action.title}</h3>
                  <p className="mb-4 text-sm text-gray-600">{action.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {action.action}
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Browse Help Topics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {helpCategories.map((category) => (
              <div key={category.id} className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <category.icon className="h-6 w-6 text-amazon-orange" />
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.topics.map((topic) => (
                    <li key={topic}>
                      <Link href={`/help/${category.id}/${topic.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:underline text-sm">
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Options */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Customer Service</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-6 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Live Chat</h3>
              <p className="mb-4 text-sm text-gray-600">
                Chat with a customer service representative
              </p>
              <div className="mb-4 flex items-center justify-center space-x-1 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Available now</span>
              </div>
              <Button variant="amazon" className="w-full">
                Start Chat
              </Button>
            </div>

            <div className="rounded-lg bg-green-50 p-6 text-center">
              <Phone className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Phone Support</h3>
              <p className="mb-4 text-sm text-gray-600">
                Speak directly with our support team
              </p>
              <div className="mb-2 text-lg font-bold text-gray-900">1-800-TFM-SHOP</div>
              <div className="mb-4 text-sm text-gray-600">24/7 Support</div>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </div>

            <div className="rounded-lg bg-orange-50 p-6 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-orange-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Email Support</h3>
              <p className="mb-4 text-sm text-gray-600">
                Send us a detailed message
              </p>
              <div className="mb-4 text-sm text-gray-600">
                Response within 24 hours
              </div>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                How do I track my order?
              </summary>
              <div className="mt-4 text-gray-600">
                <p>You can track your order by visiting the &quot;Your Orders&quot; page or by entering your order number in our tracking tool. You&apos;ll receive email updates with tracking information once your order ships.</p>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                What is your return policy?
              </summary>
              <div className="mt-4 text-gray-600">
                <p>Most items can be returned within 30 days of delivery for a full refund. Items must be in original condition and packaging. Some restrictions apply to certain categories like electronics and clothing.</p>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                How do I become a Prime member?
              </summary>
              <div className="mt-4 text-gray-600">
                <p>You can sign up for Prime membership on our Prime page. Members enjoy free one-day delivery, exclusive deals, and access to streaming services. Try it free for 30 days!</p>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                How do I cancel or change my order?
              </summary>
              <div className="mt-4 text-gray-600">
                <p>If your order hasn&apos;t shipped yet, you can cancel or modify it in &quot;Your Orders&quot; page. Once shipped, you&apos;ll need to return the item after delivery.</p>
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                What payment methods do you accept?
              </summary>
              <div className="mt-4 text-gray-600">
                <p>We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, Google Pay, and TFMshop gift cards.</p>
              </div>
            </details>
          </div>
        </section>

        {/* Feedback */}
        <section className="rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Help us improve</h2>
          <p className="mb-6 text-gray-600">
            Did you find what you were looking for? Your feedback helps us make our help center better.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="amazon">Yes, this helped</Button>
            <Button variant="outline">No, I need more help</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
