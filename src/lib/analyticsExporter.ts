// PDF Export utility for analytics
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { EnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: Array<Array<string>>;
      body?: Array<Array<string | number>>;
      theme?: string;
      headStyles?: { fillColor: number[]; textColor: number };
      margin?: { left: number; right: number };
      columnStyles?: Record<number, { cellWidth?: number }>;
    }) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export class AnalyticsExporter {
  private analytics: EnhancedAnalytics;
  private userName: string;

  constructor(analytics: EnhancedAnalytics, userName: string = 'User') {
    this.analytics = analytics;
    this.userName = userName;
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 44, 52);
    doc.text(`${this.userName}'s Credit Card Analytics Report`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Executive Summary
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Executive Summary', 14, yPosition);
    yPosition += 10;

    const summaryData = [
      ['Total Spending', `$${this.analytics.totalSpending.toLocaleString()}`],
      ['Total Rewards Earned', `$${this.analytics.totalRewards.toLocaleString()}`],
      ['Rewards Efficiency', `${this.analytics.efficiency.toFixed(1)}%`],
      ['Annual Spending Forecast', `$${this.analytics.forecasts.annualSpending.toLocaleString()}`],
      ['Annual Rewards Forecast', `$${this.analytics.forecasts.annualRewards.toLocaleString()}`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

    // Category Breakdown
    doc.setFontSize(16);
    doc.text('Category Performance', 14, yPosition);
    yPosition += 10;

    const categoryData = this.analytics.categoryBreakdown.map(cat => [
      cat.category,
      `$${cat.amount.toLocaleString()}`,
      `$${cat.rewards.toLocaleString()}`,
      `${cat.efficiency.toFixed(2)}%`,
      cat.count.toString()
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Category', 'Spending', 'Rewards', 'Efficiency', 'Transactions']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 }
    });

    // Add new page if needed
    if ((doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY > 240) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
    }

    // Card Performance
    doc.setFontSize(16);
    doc.text('Card Performance', 14, yPosition);
    yPosition += 10;

    const cardData = this.analytics.cardPerformance.map(card => [
      card.card,
      `$${card.spending.toLocaleString()}`,
      `$${card.rewards.toLocaleString()}`,
      `${card.efficiency.toFixed(2)}%`,
      `${card.utilization}%`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Card', 'Spending', 'Rewards', 'Efficiency', 'Utilization']],
      body: cardData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

    // Optimization Opportunities
    if (this.analytics.optimizationOpportunities.length > 0) {
      doc.setFontSize(16);
      doc.text('Optimization Opportunities', 14, yPosition);
      yPosition += 10;

      const optimizationData = this.analytics.optimizationOpportunities.map(opp => [
        opp.category || 'General',
        `$${opp.currentRewards}`,
        `$${opp.potentialRewards}`,
        `$${opp.impact}`,
        opp.recommendation
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Category', 'Current', 'Potential', 'Impact', 'Recommendation']],
        body: optimizationData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          4: { cellWidth: 60 }
        }
      });
    }

    // Save the PDF
    doc.save(`credit-card-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToCSV(): void {
    const csvData = [
      // Header
      ['Credit Card Analytics Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      
      // Summary
      ['EXECUTIVE SUMMARY'],
      ['Metric', 'Value'],
      ['Total Spending', this.analytics.totalSpending],
      ['Total Rewards', this.analytics.totalRewards],
      ['Efficiency', `${this.analytics.efficiency}%`],
      [''],
      
      // Category breakdown
      ['CATEGORY BREAKDOWN'],
      ['Category', 'Spending', 'Rewards', 'Efficiency', 'Transactions', 'Avg Transaction'],
      ...this.analytics.categoryBreakdown.map(cat => [
        cat.category,
        cat.amount,
        cat.rewards,
        `${cat.efficiency}%`,
        cat.count,
        cat.avgTransaction
      ]),
      [''],
      
      // Card performance
      ['CARD PERFORMANCE'],
      ['Card', 'Spending', 'Rewards', 'Efficiency', 'Utilization', 'Transactions'],
      ...this.analytics.cardPerformance.map(card => [
        card.card,
        card.spending,
        card.rewards,
        `${card.efficiency}%`,
        `${card.utilization}%`,
        card.transactions
      ]),
      [''],
      
      // Monthly trends
      ['MONTHLY TRENDS'],
      ['Month', 'Spending', 'Rewards', 'Potential'],
      ...this.analytics.monthlyTrends.map(month => [
        month.month,
        month.spending,
        month.rewards,
        month.potential
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credit-card-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportMonthlyTrendsChart(): Promise<string> {
    return new Promise((resolve) => {
      // Create a canvas element for the chart
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }

      // Basic chart drawing (simplified)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 400);
      
      // Chart title
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Monthly Spending & Rewards Trends', 400, 30);
      
      // Draw axes
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(60, 350);
      ctx.lineTo(750, 350); // X-axis
      ctx.moveTo(60, 50);
      ctx.lineTo(60, 350); // Y-axis
      ctx.stroke();

      // Plot data points (simplified)
      const maxSpending = Math.max(...this.analytics.monthlyTrends.map(m => m.spending));
      const chartWidth = 690;
      const chartHeight = 300;
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      this.analytics.monthlyTrends.forEach((month, index) => {
        const x = 60 + (index / (this.analytics.monthlyTrends.length - 1)) * chartWidth;
        const y = 350 - (month.spending / maxSpending) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Month labels
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(month.month, x, 370);
      });
      
      ctx.stroke();
      
      // Convert to base64
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    });
  }
}
