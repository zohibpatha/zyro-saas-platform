import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode, Star, Smartphone, ArrowRight } from 'lucide-react'
import Navbar from '@/components/navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-24 px-6 text-center bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-gray-900">
              Your Restaurant's Digital Presence, <span className="text-blue-600">One QR Code Away</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Boost reviews, share menus, and connect with customers effortlessly. All through a single, beautiful digital business card for your restaurant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50">
                <div className="p-4 bg-amber-100 rounded-full text-amber-600">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">QR to Review</h3>
                <p className="text-gray-600">
                  Drive more 5-star Google reviews with a frictionless experience for your dine-in customers.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                  <Smartphone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Digital Business Card</h3>
                <p className="text-gray-600">
                  A beautiful, mobile-optimized landing page with all your essential links in one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <QrCode className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Easy Management</h3>
                <p className="text-gray-600">
                  Update links, menus, and photos instantly without reprinting your QR codes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 text-center text-gray-500 text-sm border-t">
        <p>&copy; {new Date().getFullYear()} Zyro. All rights reserved.</p>
      </footer>
    </div>
  )
}
