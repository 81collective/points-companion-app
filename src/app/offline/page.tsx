'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wifi className="w-8 h-8 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry, PointAdvisor works offline too! 
          Some features may be limited until you&apos;re back online.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Available Offline:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• View your saved cards and data</li>
            <li>• Access cached recommendations</li>
            <li>• Browse previous analytics</li>
            <li>• Use basic app features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
