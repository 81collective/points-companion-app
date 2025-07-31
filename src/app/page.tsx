'use client'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Points Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Maximize your credit card rewards with AI-powered recommendations
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Smart Card Management</h3>
              <p className="text-gray-600">
                Track all your credit cards and their reward structures in one place
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-gray-600">
                Get instant suggestions for which card to use for maximum points
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Rewards Tracking</h3>
              <p className="text-gray-600">
                Monitor your points earnings and discover optimization opportunities
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}