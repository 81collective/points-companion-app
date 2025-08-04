// Welcome Bonus Calculator Library
// Points Companion - Advanced Calculations and Optimization

import { WelcomeBonusTracker, SpendingVelocity, SpendingRecommendation, SpendingPlan, BonusOpportunity } from '@/types/welcomeBonus';
import { addDays, differenceInDays, format, parseISO } from '@/lib/dateUtils';

export class BonusCalculator {
  /**
   * Calculate spending velocity and projected completion
   */
  static calculateSpendingVelocity(
    currentSpend: number,
    requiredSpend: number,
    startDate: string,
    deadline: string,
    recentTransactions: Array<{ amount: number; date: string }>
  ): SpendingVelocity {
    const start = parseISO(startDate);
    const end = parseISO(deadline);
    const now = new Date();
    
    const totalDays = differenceInDays(end, start);
    const daysPassed = differenceInDays(now, start);
    const daysRemaining = differenceInDays(end, now);
    
    // Calculate velocities from recent transactions
    const last7Days = recentTransactions.filter(t => 
      differenceInDays(now, parseISO(t.date)) <= 7
    );
    const last30Days = recentTransactions.filter(t => 
      differenceInDays(now, parseISO(t.date)) <= 30
    );
    
    const dailyAverage = daysPassed > 0 ? currentSpend / daysPassed : 0;
    const weeklyAverage = last7Days.reduce((sum, t) => sum + t.amount, 0) / Math.min(7, daysPassed);
    const monthlyAverage = last30Days.reduce((sum, t) => sum + t.amount, 0) / Math.min(30, daysPassed);
    
    // Determine trend
    const recentWeekAvg = weeklyAverage;
    const previousWeekTransactions = recentTransactions.filter(t => {
      const days = differenceInDays(now, parseISO(t.date));
      return days > 7 && days <= 14;
    });
    const previousWeekAvg = previousWeekTransactions.reduce((sum, t) => sum + t.amount, 0) / 7;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentWeekAvg > previousWeekAvg * 1.1) trend = 'increasing';
    else if (recentWeekAvg < previousWeekAvg * 0.9) trend = 'decreasing';
    
    // Project completion date
    const remainingSpend = requiredSpend - currentSpend;
    const projectedDays = dailyAverage > 0 ? Math.ceil(remainingSpend / dailyAverage) : Infinity;
    const projectedCompletion = format(addDays(now, projectedDays), 'yyyy-MM-dd');
    
    // Confidence calculation
    const velocityConsistency = this.calculateVelocityConsistency(recentTransactions);
    const timeBuffer = daysRemaining - projectedDays;
    const confidenceLevel = Math.min(100, Math.max(0, 
      (velocityConsistency * 0.6 + (timeBuffer > 0 ? 40 : 0))
    ));
    
    return {
      dailyAverage,
      weeklyAverage,
      monthlyAverage,
      trend,
      projectedCompletion,
      confidenceLevel
    };
  }
  
  /**
   * Generate intelligent spending recommendations
   */
  static generateSpendingRecommendations(
    bonus: WelcomeBonusTracker,
    userSpendingPatterns: Array<{ category: string; monthlyAverage: number }>,
    daysRemaining: number
  ): SpendingRecommendation[] {
    const remainingSpend = bonus.requiredSpend - bonus.currentSpend;
    const recommendations: SpendingRecommendation[] = [];
    
    // Calculate urgency based on time remaining and spending velocity
    const dailyTarget = remainingSpend / Math.max(1, daysRemaining);
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (daysRemaining <= 7) urgency = 'critical';
    else if (daysRemaining <= 14) urgency = 'high';
    else if (daysRemaining <= 30) urgency = 'medium';
    
    // Bill payment recommendations
    if (remainingSpend >= 500 && daysRemaining > 3) {
      recommendations.push({
        id: `bill-payment-${Date.now()}`,
        category: 'Bills & Utilities',
        amount: Math.min(remainingSpend, 1500),
        description: 'Prepay utilities, insurance, or phone bills',
        suggestedMerchants: ['Electric Company', 'Internet Provider', 'Insurance Company'],
        pointsImpact: Math.min(remainingSpend, 1500),
        urgency,
        reasoning: 'Prepaying bills is a safe way to meet spending requirements without changing your budget',
        estimatedCompletionDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        alternativeOptions: ['Gift card purchases', 'Large grocery shopping'],
        tags: ['safe', 'bills', 'prepayment']
      });
    }
    
    // Gift card strategy
    if (remainingSpend >= 100) {
      recommendations.push({
        id: `gift-cards-${Date.now()}`,
        category: 'Gift Cards',
        amount: Math.min(remainingSpend, 1000),
        description: 'Purchase gift cards for future use',
        suggestedMerchants: ['Amazon', 'Target', 'Grocery Store', 'Gas Station'],
        pointsImpact: Math.min(remainingSpend, 1000),
        urgency,
        reasoning: 'Gift cards allow you to meet spending requirements while preserving purchasing power',
        estimatedCompletionDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        alternativeOptions: ['Reload existing gift cards', 'Buy cards for holiday gifts'],
        tags: ['flexible', 'gift-cards', 'future-use']
      });
    }
    
    // Category-based recommendations
    const topCategories = userSpendingPatterns
      .sort((a, b) => b.monthlyAverage - a.monthlyAverage)
      .slice(0, 3);
    
    topCategories.forEach((pattern, index) => {
      const amount = Math.min(remainingSpend * 0.3, pattern.monthlyAverage * 2);
      if (amount >= 50) {
        recommendations.push({
          id: `category-${pattern.category}-${Date.now()}`,
          category: pattern.category,
          amount,
          description: `Increase spending in your usual ${pattern.category.toLowerCase()} category`,
          suggestedMerchants: this.getMerchantsForCategory(pattern.category),
          pointsImpact: amount,
          urgency: index === 0 ? urgency : 'low',
          reasoning: `You typically spend $${pattern.monthlyAverage.toFixed(0)}/month here, so this aligns with your normal habits`,
          estimatedCompletionDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          alternativeOptions: ['Bulk purchases', 'Stock up on essentials'],
          tags: ['natural-spending', pattern.category.toLowerCase()]
        });
      }
    });
    
    // Large purchase timing
    if (remainingSpend >= 300 && daysRemaining > 5) {
      recommendations.push({
        id: `large-purchase-${Date.now()}`,
        category: 'Large Purchases',
        amount: remainingSpend,
        description: 'Time any planned large purchases for this period',
        suggestedMerchants: ['Electronics Store', 'Furniture Store', 'Home Improvement'],
        pointsImpact: remainingSpend,
        urgency: 'medium',
        reasoning: 'Coordinate timing of necessary large purchases to efficiently meet spending requirements',
        estimatedCompletionDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        alternativeOptions: ['Split into smaller purchases', 'Buy now, use later items'],
        tags: ['large-purchase', 'timing', 'efficient']
      });
    }
    
    return recommendations.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }
  
  /**
   * Create optimized spending plan
   */
  static createSpendingPlan(
    bonus: WelcomeBonusTracker,
    recommendations: SpendingRecommendation[]
  ): SpendingPlan {
    const remainingAmount = bonus.requiredSpend - bonus.currentSpend;
    const deadline = parseISO(bonus.deadline);
    const now = new Date();
    const timeRemaining = Math.max(1, differenceInDays(deadline, now));
    
    // Create timeline based on recommendations
    const timeline: SpendingPlan['timeline'] = [];
    let plannedTotal = 0;
    
    recommendations.forEach((rec, index) => {
      if (plannedTotal < remainingAmount) {
        const amount = Math.min(rec.amount, remainingAmount - plannedTotal);
        timeline.push({
          date: format(addDays(now, index + 1), 'yyyy-MM-dd'),
          plannedSpending: amount,
          category: rec.category,
          description: rec.description
        });
        plannedTotal += amount;
      }
    });
    
    // Risk assessment
    const completionProbability = this.calculateCompletionProbability(
      remainingAmount,
      timeRemaining,
      plannedTotal,
      recommendations.length
    );
    
    const riskFactors: string[] = [];
    const mitigationStrategies: string[] = [];
    
    if (timeRemaining <= 7) {
      riskFactors.push('Very limited time remaining');
      mitigationStrategies.push('Focus on immediate large purchases or bill payments');
    }
    
    if (remainingAmount > plannedTotal) {
      riskFactors.push('Planned spending does not meet requirement');
      mitigationStrategies.push('Add additional gift card purchases or prepaid expenses');
    }
    
    if (recommendations.length < 3) {
      riskFactors.push('Limited spending options identified');
      mitigationStrategies.push('Explore additional categories or consider balance transfers');
    }
    
    return {
      id: `plan-${bonus.id}-${Date.now()}`,
      bonusId: bonus.id,
      totalRequired: bonus.requiredSpend,
      remainingAmount,
      timeRemaining,
      recommendations,
      timeline,
      riskAssessment: {
        completionProbability,
        riskFactors,
        mitigationStrategies
      }
    };
  }
  
  /**
   * Calculate opportunity cost and value optimization
   */
  static calculateOpportunityValue(
    bonuses: WelcomeBonusTracker[],
    availableSpending: number
  ): Array<{ bonusId: string; efficiency: number; recommendation: string }> {
    return bonuses
      .filter(b => b.status === 'active')
      .map(bonus => {
        const remainingSpend = bonus.requiredSpend - bonus.currentSpend;
        const daysRemaining = Math.max(1, differenceInDays(parseISO(bonus.deadline), new Date()));
        const efficiency = bonus.estimatedValue / remainingSpend;
        const urgencyMultiplier = Math.max(0.1, 1 - (daysRemaining / 90)); // Higher urgency = higher multiplier
        const adjustedEfficiency = efficiency * (1 + urgencyMultiplier);
        
        let recommendation = '';
        if (remainingSpend <= availableSpending * 0.3) {
          recommendation = 'Priority: Complete this bonus first';
        } else if (adjustedEfficiency > 0.02) {
          recommendation = 'High value: Focus spending here';
        } else if (daysRemaining <= 14) {
          recommendation = 'Urgent: Complete soon or risk expiration';
        } else {
          recommendation = 'Low priority: Complete when convenient';
        }
        
        return {
          bonusId: bonus.id,
          efficiency: adjustedEfficiency,
          recommendation
        };
      })
      .sort((a, b) => b.efficiency - a.efficiency);
  }
  
  /**
   * Multi-bonus coordination strategy
   */
  static coordinateMultipleBonuses(
    bonuses: WelcomeBonusTracker[],
    monthlySpending: number
  ): Array<{ bonusId: string; priority: number; suggestedAllocation: number }> {
    const activeBonuses = bonuses.filter(b => b.status === 'active');
    const totalRemaining = activeBonuses.reduce((sum, b) => sum + (b.requiredSpend - b.currentSpend), 0);
    
    return activeBonuses.map(bonus => {
      const remainingSpend = bonus.requiredSpend - bonus.currentSpend;
      const daysRemaining = Math.max(1, differenceInDays(parseISO(bonus.deadline), new Date()));
      const dailyRequired = remainingSpend / daysRemaining;
      const efficiency = bonus.estimatedValue / remainingSpend;
      
      // Priority score based on urgency, efficiency, and achievability
      const urgencyScore = Math.max(0, 100 - daysRemaining);
      const efficiencyScore = Math.min(100, efficiency * 1000);
      const achievabilityScore = remainingSpend <= monthlySpending ? 100 : (monthlySpending / remainingSpend) * 100;
      
      const priority = (urgencyScore * 0.4 + efficiencyScore * 0.3 + achievabilityScore * 0.3);
      const suggestedAllocation = (priority / 100) * monthlySpending;
      
      return {
        bonusId: bonus.id,
        priority,
        suggestedAllocation: Math.min(suggestedAllocation, remainingSpend)
      };
    }).sort((a, b) => b.priority - a.priority);
  }
  
  // Helper methods
  private static calculateVelocityConsistency(
    transactions: Array<{ amount: number; date: string }>
  ): number {
    if (transactions.length < 3) return 50;
    
    const dailyAmounts = transactions.map(t => t.amount);
    const mean = dailyAmounts.reduce((sum, amt) => sum + amt, 0) / dailyAmounts.length;
    const variance = dailyAmounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / dailyAmounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;
    
    // Lower variation = higher consistency (inverse relationship)
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }
  
  private static calculateCompletionProbability(
    remainingAmount: number,
    timeRemaining: number,
    plannedSpending: number,
    recommendationCount: number
  ): number {
    let probability = 0;
    
    // Base probability from planned spending coverage
    const coverage = Math.min(1, plannedSpending / remainingAmount);
    probability += coverage * 60;
    
    // Time factor
    const timeScore = timeRemaining >= 30 ? 30 : timeRemaining >= 14 ? 20 : timeRemaining >= 7 ? 10 : 5;
    probability += timeScore;
    
    // Recommendation diversity
    const diversityScore = Math.min(10, recommendationCount * 2);
    probability += diversityScore;
    
    return Math.min(100, Math.max(0, probability));
  }
  
  private static getMerchantsForCategory(category: string): string[] {
    const merchantMap: Record<string, string[]> = {
      'Groceries': ['Walmart', 'Target', 'Kroger', 'Safeway', 'Whole Foods'],
      'Gas': ['Shell', 'Exxon', 'BP', 'Chevron', 'Costco Gas'],
      'Dining': ['McDonald\'s', 'Starbucks', 'Local Restaurants', 'Food Delivery'],
      'Shopping': ['Amazon', 'Target', 'Best Buy', 'Department Stores'],
      'Travel': ['Airlines', 'Hotels', 'Car Rental', 'Travel Agencies'],
      'Entertainment': ['Netflix', 'Movie Theaters', 'Streaming Services'],
      'Bills & Utilities': ['Electric Company', 'Internet Provider', 'Phone Bill'],
      'Gift Cards': ['Amazon Gift Cards', 'Store Gift Cards', 'Visa Gift Cards']
    };
    
    return merchantMap[category] || ['Various Merchants'];
  }
}
