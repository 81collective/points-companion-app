'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true
}) => {
  const baseClasses = `bg-gray-200 ${animate ? 'animate-pulse' : ''}`;
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return '';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'text':
        return { width: '100%', height: '1rem' };
      default:
        return { width: '100%', height: '2rem' };
    }
  };

  const defaultSize = getDefaultSize();
  const style = {
    width: width || defaultSize.width,
    height: height || defaultSize.height
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <LoadingSkeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <LoadingSkeleton variant="text" height="1.25rem" className="mb-2" />
        <LoadingSkeleton variant="text" width="60%" height="1rem" />
      </div>
    </div>
    <div className="space-y-3">
      <LoadingSkeleton variant="text" lines={2} />
      <div className="flex justify-between">
        <LoadingSkeleton variant="text" width="40%" />
        <LoadingSkeleton variant="text" width="30%" />
      </div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton 
            key={`header-${index}`} 
            variant="text" 
            width="120px" 
            height="1rem" 
            className="flex-1"
          />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <LoadingSkeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                variant="text" 
                height="1rem"
                className="flex-1"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = true, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        {showAvatar && (
          <LoadingSkeleton variant="circular" width={40} height={40} />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" height="1rem" />
          <LoadingSkeleton variant="text" width="70%" height="0.875rem" />
        </div>
        <LoadingSkeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC<{ 
  type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}> = ({ type = 'bar', className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    {/* Chart Title */}
    <div className="mb-6">
      <LoadingSkeleton variant="text" width="200px" height="1.5rem" className="mb-2" />
      <LoadingSkeleton variant="text" width="300px" height="1rem" />
    </div>
    
    {/* Chart Area */}
    <div className="h-64 flex items-end justify-between space-x-2">
      {type === 'pie' ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingSkeleton variant="circular" width={200} height={200} />
        </div>
      ) : type === 'line' || type === 'area' ? (
        <div className="w-full h-full relative">
          <LoadingSkeleton variant="rectangular" width="100%" height="100%" className="rounded" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-32 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50 rounded" />
          </div>
        </div>
      ) : (
        // Bar chart
        Array.from({ length: 8 }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            variant="rectangular"
            width="100%"
            height={`${Math.random() * 60 + 40}%`}
            className="flex-1 rounded-t"
          />
        ))
      )}
    </div>
    
    {/* Legend */}
    <div className="mt-4 flex justify-center space-x-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <LoadingSkeleton variant="circular" width={12} height={12} />
          <LoadingSkeleton variant="text" width="60px" height="0.875rem" />
        </div>
      ))}
    </div>
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <LoadingSkeleton variant="text" width="300px" height="2rem" className="mb-2" />
        <LoadingSkeleton variant="text" width="400px" height="1rem" />
      </div>
      <LoadingSkeleton variant="rounded" width={120} height={40} />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <LoadingSkeleton variant="circular" width={40} height={40} />
            <LoadingSkeleton variant="text" width="60px" height="1rem" />
          </div>
          <LoadingSkeleton variant="text" width="80px" height="1.5rem" className="mb-1" />
          <LoadingSkeleton variant="text" width="120px" height="0.875rem" />
        </div>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <div className="space-y-4">
        <CardSkeleton />
        <ListSkeleton items={3} />
      </div>
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number; 
  hasSubmit?: boolean;
  className?: string;
}> = ({ fields = 5, hasSubmit = true, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <LoadingSkeleton variant="text" width="120px" height="1rem" />
        <LoadingSkeleton variant="rounded" width="100%" height={40} />
      </div>
    ))}
    
    {hasSubmit && (
      <div className="flex justify-end space-x-3 pt-4">
        <LoadingSkeleton variant="rounded" width={80} height={40} />
        <LoadingSkeleton variant="rounded" width={100} height={40} />
      </div>
    )}
  </div>
);

export default LoadingSkeleton;
