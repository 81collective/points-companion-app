'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';

// Memoized card component for credit cards
interface CreditCardItemProps {
  card: {
    id: string;
    name: string;
    issuer: string;
    image?: string;
    annualFee: number;
    rewardRate: number;
    category?: string;
    isRecommended?: boolean;
  };
  onClick?: (cardId: string) => void;
  className?: string;
}

export const CreditCardItem = memo(function CreditCardItem({
  card,
  onClick,
  className
}: CreditCardItemProps) {
  const handleClick = useCallback(() => {
    onClick?.(card.id);
  }, [onClick, card.id]);

  const rewardDisplay = useMemo(() => {
    return `${card.rewardRate}%`;
  }, [card.rewardRate]);

  const feeDisplay = useMemo(() => {
    return card.annualFee === 0 ? 'No Annual Fee' : `$${card.annualFee}`;
  }, [card.annualFee]);

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
        card.isRecommended && 'ring-2 ring-blue-500',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{card.name}</CardTitle>
            <p className="text-sm text-gray-600">{card.issuer}</p>
          </div>
          {card.image && (
            <OptimizedImage
              src={card.image}
              alt={card.name}
              width={60}
              height={38}
              className="rounded"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{rewardDisplay} rewards</p>
            <p className="text-xs text-gray-500">{feeDisplay}</p>
          </div>
          {card.isRecommended && (
            <Badge variant="secondary">Recommended</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized transaction item component
interface TransactionItemProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    cardUsed?: string;
    pointsEarned?: number;
  };
  onEdit?: (transactionId: string) => void;
  className?: string;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  onEdit,
  className
}: TransactionItemProps) {
  const handleEdit = useCallback(() => {
    onEdit?.(transaction.id);
  }, [onEdit, transaction.id]);

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(transaction.amount);
  }, [transaction.amount]);

  const formattedDate = useMemo(() => {
    return new Date(transaction.date).toLocaleDateString();
  }, [transaction.date]);

  const categoryColor = useMemo(() => {
    const colors: Record<string, string> = {
      'dining': 'bg-orange-100 text-orange-800',
      'travel': 'bg-blue-100 text-blue-800',
      'gas': 'bg-green-100 text-green-800',
      'groceries': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[transaction.category.toLowerCase()] || colors.other;
  }, [transaction.category]);

  return (
    <div className={cn('flex items-center justify-between p-4 border-b', className)}>
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <p className="font-medium">{transaction.description}</p>
          <Badge className={categoryColor}>{transaction.category}</Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{formattedDate}</span>
          {transaction.cardUsed && <span>• {transaction.cardUsed}</span>}
          {transaction.pointsEarned && (
            <span>• {transaction.pointsEarned} points</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-semibold">{formattedAmount}</span>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
});

// Memoized analytics card component
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const AnalyticsCard = memo(function AnalyticsCard({
  title,
  value,
  change,
  period,
  icon,
  trend = 'neutral',
  className
}: AnalyticsCardProps) {
  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [trend]);

  const changeDisplay = useMemo(() => {
    if (change === undefined) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  }, [change]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {changeDisplay && period && (
            <p className={cn('text-sm', trendColor)}>
              {changeDisplay} from {period}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
});

// Memoized recommendation card component
interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    description: string;
    potentialSavings?: number;
    confidence: number;
    cardSuggestion?: string;
    category?: string;
  };
  onApply?: (recommendationId: string) => void;
  onDismiss?: (recommendationId: string) => void;
  className?: string;
}

export const RecommendationCard = memo(function RecommendationCard({
  recommendation,
  onApply,
  onDismiss,
  className
}: RecommendationCardProps) {
  const handleApply = useCallback(() => {
    onApply?.(recommendation.id);
  }, [onApply, recommendation.id]);

  const handleDismiss = useCallback(() => {
    onDismiss?.(recommendation.id);
  }, [onDismiss, recommendation.id]);

  const confidenceColor = useMemo(() => {
    if (recommendation.confidence >= 80) return 'bg-green-100 text-green-800';
    if (recommendation.confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }, [recommendation.confidence]);

  const savingsDisplay = useMemo(() => {
    if (!recommendation.potentialSavings) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(recommendation.potentialSavings);
  }, [recommendation.potentialSavings]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold">{recommendation.title}</h3>
            <p className="text-sm text-gray-600">{recommendation.description}</p>
            {recommendation.cardSuggestion && (
              <p className="text-sm font-medium">
                Suggested card: {recommendation.cardSuggestion}
              </p>
            )}
          </div>
          <Badge className={confidenceColor}>
            {recommendation.confidence}% confidence
          </Badge>
        </div>
        
        {savingsDisplay && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              Potential monthly savings: <span className="font-semibold">{savingsDisplay}</span>
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          {onApply && (
            <Button onClick={handleApply} className="flex-1">
              Apply Recommendation
            </Button>
          )}
          {onDismiss && (
            <Button variant="outline" onClick={handleDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});
