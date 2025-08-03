// src/app/test/page.tsx - Simple test page to verify Tailwind is working
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tailwind CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Card Component</h2>
            <p className="text-gray-600 mb-4">This is a test card to verify Tailwind CSS is working properly.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Test Button
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Primary Colors</h2>
            <div className="space-y-2">
              <div className="bg-primary-500 text-white p-2 rounded">Primary 500</div>
              <div className="bg-primary-600 text-white p-2 rounded">Primary 600</div>
              <div className="bg-primary-700 text-white p-2 rounded">Primary 700</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Typography</h2>
            <p className="text-sm text-gray-500">Small text</p>
            <p className="text-base text-gray-600">Base text</p>
            <p className="text-lg text-gray-700">Large text</p>
            <p className="text-xl font-semibold text-gray-800">Extra large semibold</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Spacing & Layout</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">Padding 4</div>
              <div className="bg-gray-200 p-6 rounded">Padding 6</div>
              <div className="bg-gray-300 p-8 rounded">Padding 8</div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800 font-medium">✅ If you can see this styled content, Tailwind CSS is working correctly!</p>
        </div>
      </div>
    </div>
  );
}
