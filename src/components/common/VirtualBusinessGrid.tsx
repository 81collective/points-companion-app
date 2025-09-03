import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Navigation } from 'lucide-react';
import { Business } from '@/types/location.types';

interface VirtualBusinessGridProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onBusinessSelect: (business: Business) => void;
  currentCategory?: {
    icon: string;
    color: string;
  };
  className?: string;
}

interface BusinessCardProps {
  business: Business;
  isSelected: boolean;
  onClick: () => void;
  category?: {
    icon: string;
    color: string;
  };
}

const BusinessCard = React.memo<BusinessCardProps>(({
  business,
  isSelected,
  onClick,
  category
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`cursor-pointer bg-white rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-lg hover:border-blue-300 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg truncate">{business.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{business.address}</p>
        </div>
        {category && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
            {category.icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {business.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-gray-600 font-medium">{business.rating}</span>
            </div>
          )}
          {business.distance && (
            <div className="flex items-center space-x-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">
                {business.distance < 1609.34
                  ? `${Math.round(business.distance * 3.28084)}ft`
                  : `${(business.distance * 0.000621371).toFixed(1)}mi`
                }
              </span>
            </div>
          )}
        </div>

        <Navigation className="h-5 w-5 text-gray-400" />
      </div>
    </motion.div>
  );
});

BusinessCard.displayName = 'BusinessCard';

export default function VirtualBusinessGrid({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  currentCategory,
  className = ""
}: VirtualBusinessGridProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Calculate responsive columns
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3; // SSR fallback
    if (window.innerWidth < 768) return 1; // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    return 3; // Desktop
  };

  const columnCount = getColumnCount();
  const itemHeight = 160;
  const visibleItems = businesses.slice(visibleRange.start, visibleRange.end);

  // Handle scroll to update visible range
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const containerHeight = e.currentTarget.clientHeight;
    const start = Math.floor(scrollTop / itemHeight) * columnCount;
    const end = start + (Math.ceil(containerHeight / itemHeight) + 2) * columnCount;
    setVisibleRange({ start: Math.max(0, start), end: Math.min(businesses.length, end) });
  };

  if (businesses.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No businesses found in this area</p>
          <p className="text-sm mt-2">Try adjusting your search radius or category</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="overflow-auto"
        style={{ height: '600px' }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: Math.ceil(businesses.length / columnCount) * itemHeight,
            position: 'relative'
          }}
        >
          <div
            className="grid gap-4 p-4"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              position: 'absolute',
              top: Math.floor(visibleRange.start / columnCount) * itemHeight,
              width: '100%'
            }}
          >
            {visibleItems.map((business, index) => (
              <BusinessCard
                key={business.id || index}
                business={business}
                isSelected={selectedBusiness?.id === business.id}
                onClick={() => onBusinessSelect(business)}
                category={currentCategory}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
