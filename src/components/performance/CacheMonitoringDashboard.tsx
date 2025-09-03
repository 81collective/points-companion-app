'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Database,
  Zap,
  Trash2,
  RefreshCw,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';
import { advancedApiCache, getCacheMetrics } from '@/lib/apiCache';
import { useBackgroundSync } from '@/lib/backgroundSync';
import { useCacheWarming } from '@/lib/cacheWarming';

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  sets: number;
  deletes: number;
  size: number;
  itemCount: number;
  hitRate: string;
  sizeFormatted: string;
  efficiency: string;
}

export default function CacheMonitoringDashboard() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { pending, failed, processing, isOnline } = useBackgroundSync();
  const { isWarming, queueLength: warmupQueueLength } = useCacheWarming();

  useEffect(() => {
    updateMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const cacheMetrics = getCacheMetrics();
    setMetrics(cacheMetrics);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    updateMetrics();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      advancedApiCache.clear();
      updateMetrics();
    }
  };

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency.toLowerCase()) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs optimization': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHitRateColor = (hitRate: string) => {
    const rate = parseFloat(hitRate);
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading cache metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Cache Performance Dashboard</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHitRateColor(metrics.hitRate)}`}>
              {metrics.hitRate}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.hits} hits / {metrics.hits + metrics.misses} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sizeFormatted}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.itemCount} items cached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={`${getEfficiencyColor(metrics.efficiency)} text-white`}>
              {metrics.efficiency}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Performance rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Background Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pending}
            </div>
            <p className="text-xs text-muted-foreground">
              {failed} failed • {processing ? 'Processing' : 'Idle'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cache Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Cache Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cache Hits</span>
              <span className="font-medium text-green-600">{metrics.hits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cache Misses</span>
              <span className="font-medium text-red-600">{metrics.misses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cache Sets</span>
              <span className="font-medium text-blue-600">{metrics.sets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Evictions</span>
              <span className="font-medium text-orange-600">{metrics.evictions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Deletions</span>
              <span className="font-medium text-gray-600">{metrics.deletes.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Online Status</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cache Warming</span>
              <Badge variant={isWarming ? "default" : "secondary"}>
                {isWarming ? 'Active' : 'Idle'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sync Queue</span>
              <span className="font-medium">{pending} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Warmup Queue</span>
              <span className="font-medium">{warmupQueueLength} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Failed Syncs</span>
              <span className="font-medium text-red-600">{failed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parseFloat(metrics.hitRate) < 60 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800">Low Cache Hit Rate</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider increasing cache TTL or implementing better cache warming strategies.
                </p>
              </div>
            )}

            {metrics.evictions > metrics.sets * 0.1 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800">High Eviction Rate</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Cache is filling up quickly. Consider increasing cache size or implementing better cache invalidation.
                </p>
              </div>
            )}

            {failed > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Sync Failures Detected</h4>
                <p className="text-sm text-red-700 mt-1">
                  {failed} background sync operations failed. Check network connectivity or retry failed operations.
                </p>
              </div>
            )}

            {parseFloat(metrics.hitRate) >= 80 && metrics.evictions < metrics.sets * 0.05 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800">Excellent Performance</h4>
                <p className="text-sm text-green-700 mt-1">
                  Cache is performing optimally with high hit rates and low eviction rates.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
