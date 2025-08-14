import { Metadata } from 'next';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';

export const metadata: Metadata = {
  title: 'Loyalty Dashboard - PointAdvisor',
  description: 'Track your points, miles, and elite status across all loyalty programs',
};

export default function LoyaltyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoyaltyDashboard />
    </div>
  );
}
