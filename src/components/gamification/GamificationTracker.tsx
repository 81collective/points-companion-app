'use client';

import { useGamificationAutoTracker } from '@/hooks/useGamification';

const GamificationTracker: React.FC = () => {
  useGamificationAutoTracker();
  return null; // This component doesn't render anything
};

export default GamificationTracker;
