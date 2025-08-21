'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of extra items to render outside viewport
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  getItemKey
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const itemIndex = startIndex + index;
            const key = getItemKey ? getItemKey(item, itemIndex) : itemIndex;
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, itemIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Virtualized grid component for card layouts
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 16,
  overscan = 5,
  onScroll,
  getItemKey
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleRows = [];
  for (let row = startRow; row <= endRow; row++) {
    const startIndex = row * columnsPerRow;
    const endIndex = Math.min(items.length - 1, startIndex + columnsPerRow - 1);
    const rowItems = items.slice(startIndex, endIndex + 1);
    visibleRows.push({ row, items: rowItems, startIndex });
  }

  const totalHeight = totalRows * rowHeight;
  const offsetY = startRow * rowHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleRows.map(({ row, items: rowItems, startIndex }) => (
            <div
              key={row}
              style={{ 
                height: rowHeight,
                display: 'flex',
                gap: gap,
                alignItems: 'flex-start',
                paddingBottom: gap
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex;
                const key = getItemKey ? getItemKey(item, itemIndex) : itemIndex;
                
                return (
                  <div
                    key={key}
                    style={{ 
                      width: itemWidth,
                      height: itemHeight,
                      flexShrink: 0
                    }}
                  >
                    {renderItem(item, itemIndex)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for managing virtualization state
export function useVirtualization(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleRange = { startIndex, endIndex };
  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight,
    offsetY
  };
}
