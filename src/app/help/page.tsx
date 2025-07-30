import Link from 'next/link'
import { Search, Phone, MessageCircle, Mail, FileText, Truck, RefreshCw, CreditCard, Shield, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-amazon-navy text-white">
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

export const metadata = {
  title: 'Help & Customer Service - TFMshop',
  description: 'Get help with orders, returns, account issues, and more. 24/7 customer support available.',
}
