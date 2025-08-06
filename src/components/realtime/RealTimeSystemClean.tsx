'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const RealTimeSystemClean: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Simulate connection
      setIsConnected(true);
      setConnectionTime(new Date());
      setActiveUsers(Math.floor(Math.random() * 50) + 10);

      // Update active users periodically
      const interval = setInterval(() => {
        setActiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const connectionDuration = connectionTime ? 
    Math.floor((new Date().getTime() - connectionTime.getTime()) / 1000) : 0;

  return (
    <div className="relative group">
      <Link
        href="/realtime"
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </>
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
        </div>
        
        <div className="hidden lg:block">
          <div className="flex items-center space-x-1 text-sm">
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
            {isConnected && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{activeUsers} online</span>
              </>
            )}
          </div>
        </div>

        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          {isConnected ? (
            <div className="space-y-1">
              <div>Real-time features active</div>
              <div className="text-gray-300">Connected for {connectionDuration}s</div>
            </div>
          ) : (
            'Real-time features offline'
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeSystemClean;
