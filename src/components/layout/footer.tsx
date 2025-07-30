import Link from 'next/link'
import { BackToTop } from '@/components/ui/back-to-top'

export function Footer() {
  return (
    <footer className="bg-amazon-navy text-white">
      {/* Back to top */}
      <BackToTop />

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Get to Know Us */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:underline">About TFMshop</Link></li>
              <li><Link href="/careers" className="hover:underline">Careers</Link></li>
              <li><Link href="/press" className="hover:underline">Press Releases</Link></li>
              <li><Link href="/investor" className="hover:underline">Investor Relations</Link></li>
              <li><Link href="/devices" className="hover:underline">TFMshop Devices</Link></li>
              <li><Link href="/science" className="hover:underline">TFMshop Science</Link></li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sell" className="hover:underline">Sell products on TFMshop</Link></li>
              <li><Link href="/business" className="hover:underline">Sell on TFMshop Business</Link></li>
              <li><Link href="/apps" className="hover:underline">Sell apps on TFMshop</Link></li>
              <li><Link href="/affiliate" className="hover:underline">Become an Affiliate</Link></li>
              <li><Link href="/advertise" className="hover:underline">Advertise Your Products</Link></li>
              <li><Link href="/self-publish" className="hover:underline">Self-Publish with Us</Link></li>
            </ul>
          </div>

          {/* Payment Products */}
          <div>
            <h3 className="mb-4 text-base font-semibold">TFMshop Payment Products</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/business-card" className="hover:underline">TFMshop Business Card</Link></li>
              <li><Link href="/rewards" className="hover:underline">Shop with Points</Link></li>
              <li><Link href="/reload" className="hover:underline">Reload Your Balance</Link></li>
              <li><Link href="/currency" className="hover:underline">TFMshop Currency Converter</Link></li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/covid" className="hover:underline">TFMshop and COVID-19</Link></li>
              <li><Link href="/account" className="hover:underline">Your Account</Link></li>
              <li><Link href="/orders" className="hover:underline">Your Orders</Link></li>
              <li><Link href="/shipping" className="hover:underline">Shipping Rates & Policies</Link></li>
              <li><Link href="/returns" className="hover:underline">Returns & Replacements</Link></li>
              <li><Link href="/content" className="hover:underline">Manage Your Content and Devices</Link></li>
              <li><Link href="/assistant" className="hover:underline">TFMshop Assistant</Link></li>
              <li><Link href="/help" className="hover:underline">Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-amazon-navy-light">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-xl font-bold">
                TFMshop
              </Link>
              
              {/* Language and country selector */}
              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center space-x-1 rounded border border-gray-400 px-2 py-1 hover:bg-amazon-navy-light">
                  <span>🌐 English</span>
                </button>
                <button className="flex items-center space-x-1 rounded border border-gray-400 px-2 py-1 hover:bg-amazon-navy-light">
                  <span>💵 USD - U.S. Dollar</span>
                </button>
                <button className="flex items-center space-x-1 rounded border border-gray-400 px-2 py-1 hover:bg-amazon-navy-light">
                  <img src="/flags/us.svg" alt="US" className="h-4 w-6" />
                  <span>United States</span>
                </button>
              </div>
            </div>
          </div>

          {/* Countries/regions */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-300 md:grid-cols-4 lg:grid-cols-7">
            <Link href="/au" className="hover:underline">TFMshop Australia</Link>
            <Link href="/br" className="hover:underline">TFMshop Brazil</Link>
            <Link href="/ca" className="hover:underline">TFMshop Canada</Link>
            <Link href="/cn" className="hover:underline">TFMshop China</Link>
            <Link href="/fr" className="hover:underline">TFMshop France</Link>
            <Link href="/de" className="hover:underline">TFMshop Germany</Link>
            <Link href="/in" className="hover:underline">TFMshop India</Link>
            <Link href="/it" className="hover:underline">TFMshop Italy</Link>
            <Link href="/jp" className="hover:underline">TFMshop Japan</Link>
            <Link href="/mx" className="hover:underline">TFMshop Mexico</Link>
            <Link href="/nl" className="hover:underline">TFMshop Netherlands</Link>
            <Link href="/pl" className="hover:underline">TFMshop Poland</Link>
            <Link href="/sg" className="hover:underline">TFMshop Singapore</Link>
            <Link href="/es" className="hover:underline">TFMshop Spain</Link>
          </div>

          {/* Legal links */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-300">
            <Link href="/conditions" className="hover:underline">Conditions of Use</Link>
            <Link href="/privacy" className="hover:underline">Privacy Notice</Link>
            <Link href="/interest-ads" className="hover:underline">Interest-Based Ads</Link>
            <span>© 1996-2024, TFMshop.com, Inc. or its affiliates</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
