'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Lawha</h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <span className="text-white py-2">Welcome, {user.email}</span>
                <Link
                  href="/gallery"
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                >
                  Start Designing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Create Your Custom Canvas
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Design beautiful canvas prints with our easy-to-use editor. Upload your images,
          add text, and create stunning wall art in minutes.
        </p>

        {user ? (
          <Link
            href="/gallery"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg transition-colors"
          >
            Browse Products & Design
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-lg transition-colors"
            >
              Sign In to Start
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors border-2 border-white"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="bg-white bg-opacity-5 backdrop-blur-md py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Why Choose Lawha?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Easy Editing',
                description: 'Drag, drop, and customize your designs with our intuitive canvas editor',
              },
              {
                title: 'High Quality',
                description: 'Print-ready designs at 300 DPI for stunning, professional results',
              },
              {
                title: 'Multiple Options',
                description: 'Choose from canvas sizes, frames, and finishes to match your style',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white bg-opacity-10 rounded-lg p-6 text-center">
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-30 text-white py-8 text-center">
        <p>© 2026 Lawha. All rights reserved.</p>
      </footer>
    </div>
  );
}
