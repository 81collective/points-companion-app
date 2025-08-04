import React from 'react';
import { LoyaltyAccount } from '@/types/loyalty';

interface AddLoyaltyAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (account: LoyaltyAccount) => void;
}

export default function AddLoyaltyAccount({ isOpen, onClose, onAccountAdded }: AddLoyaltyAccountProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Add Loyalty Account</h2>
        <p className="text-gray-600 mb-6">
          🚧 The full add account feature is coming soon! 
          <br /><br />
          The dashboard is now connected to a complete API system with:
          <br />• Real-time data synchronization
          <br />• Secure account management  
          <br />• Analytics and insights
          <br />• Database integration ready
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
