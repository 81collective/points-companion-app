'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Plane,
  Building,
  ShoppingBag,
  Utensils
} from 'lucide-react';
import { LoyaltyAccount, LoyaltyProgram } from '@/types/loyalty';
import { getAllPrograms, getProgramById } from '@/lib/loyaltyPrograms';

interface AddLoyaltyAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (account: LoyaltyAccount) => void;
}

interface FormData {
  programId: string;
  accountNumber: string;
  accountName: string;
  syncEnabled: boolean;
  syncFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export default function AddLoyaltyAccount({ isOpen, onClose, onAccountAdded }: AddLoyaltyAccountProps) {
  const [step, setStep] = useState<'search' | 'details' | 'credentials' | 'success'>('search');
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<LoyaltyProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [formData, setFormData] = useState<FormData>({
    programId: '',
    accountNumber: '',
    accountName: '',
    syncEnabled: false,
    syncFrequency: 'weekly',
    credentials: {}
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load programs on mount
  useEffect(() => {
    const allPrograms = getAllPrograms();
    setPrograms(allPrograms);
    setFilteredPrograms(allPrograms);
  }, []);

  // Filter programs based on search and category
  useEffect(() => {
    let filtered = programs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(program => program.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(query) ||
        (program.description && program.description.toLowerCase().includes(query)) ||
        program.category.toLowerCase().includes(query)
      );
    }

    setFilteredPrograms(filtered);
  }, [programs, searchQuery, selectedCategory]);

  const handleProgramSelect = (program: LoyaltyProgram) => {
    setSelectedProgram(program);
    setFormData(prev => ({
      ...prev,
      programId: program.id,
      accountName: `My ${program.name} Account`
    }));
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return;
    }
    if (!formData.accountName.trim()) {
      setError('Account name is required');
      return;
    }
    setError('');
    
    if (formData.syncEnabled) {
      setStep('credentials');
    } else {
      handleCreateAccount();
    }
  };

  const handleCredentialsSubmit = () => {
    if (formData.syncEnabled) {
      if (!formData.credentials.username?.trim()) {
        setError('Username is required for sync');
        return;
      }
      if (!formData.credentials.password?.trim()) {
        setError('Password is required for sync');
        return;
      }
    }
    setError('');
    handleCreateAccount();
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newAccount: LoyaltyAccount = {
        id: `account_${Date.now()}`,
        userId: 'user1',
        programId: formData.programId,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        balance: {
          current: 0,
          pending: 0
        },
        certificates: [],
        lastUpdated: new Date().toISOString(),
        syncEnabled: formData.syncEnabled,
        syncFrequency: formData.syncFrequency,
        credentials: {
          encrypted: formData.syncEnabled,
          syncStatus: formData.syncEnabled ? 'connected' : 'disconnected'
        }
      };

      onAccountAdded(newAccount);
      setStep('success');
      
      // Close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedProgram(null);
    setFormData({
      programId: '',
      accountNumber: '',
      accountName: '',
      syncEnabled: false,
      syncFrequency: 'weekly',
      credentials: {}
    });
    setError('');
    setLoading(false);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'airline': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Building className="h-5 w-5" />;
      case 'credit_card': return <CreditCard className="h-5 w-5" />;
      case 'shopping': return <ShoppingBag className="h-5 w-5" />;
      case 'dining': return <Utensils className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'airline': return 'bg-blue-100 text-blue-700';
      case 'hotel': return 'bg-green-100 text-green-700';
      case 'credit_card': return 'bg-purple-100 text-purple-700';
      case 'shopping': return 'bg-orange-100 text-orange-700';
      case 'dining': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Loyalty Account</h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === 'search' && 'Choose your loyalty program'}
                {step === 'details' && 'Enter your account details'}
                {step === 'credentials' && 'Set up automatic sync'}
                {step === 'success' && 'Account added successfully!'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              {[
                { key: 'search', label: 'Program' },
                { key: 'details', label: 'Details' },
                { key: 'credentials', label: 'Sync' },
                { key: 'success', label: 'Complete' }
              ].map((stepInfo, index) => (
                <div key={stepInfo.key} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepInfo.key ? 'bg-blue-600 text-white' :
                    ['search', 'details', 'credentials', 'success'].indexOf(step) > index ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {['search', 'details', 'credentials', 'success'].indexOf(step) > index ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{stepInfo.label}</span>
                  {index < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Program Search */}
            {step === 'search' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search loyalty programs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[
                      { key: 'all', label: 'All Programs' },
                      { key: 'airline', label: 'Airlines' },
                      { key: 'hotel', label: 'Hotels' },
                      { key: 'credit_card', label: 'Credit Cards' },
                      { key: 'shopping', label: 'Shopping' },
                      { key: 'dining', label: 'Dining' }
                    ].map(category => (
                      <button
                        key={category.key}
                        onClick={() => setSelectedCategory(category.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.key !== 'all' && getCategoryIcon(category.key)}
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredPrograms.map(program => (
                    <motion.button
                      key={program.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleProgramSelect(program)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(program.category)}`}>
                            {getCategoryIcon(program.category)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{program.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{program.category}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {program.description || `${program.pointsName} loyalty program`}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {program.pointsName}
                        </span>
                        {program.eliteTiers && program.eliteTiers.length > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            {program.eliteTiers.length} Elite Tiers
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {filteredPrograms.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-600">Try adjusting your search or category filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 'details' && selectedProgram && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${getCategoryColor(selectedProgram.category)}`}>
                    {getCategoryIcon(selectedProgram.category)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedProgram.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedProgram.description || `${selectedProgram.pointsName} loyalty program`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your account/member number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Give this account a name"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Auto-Sync</h4>
                        <p className="text-sm text-gray-600">Automatically update your balance and status</p>
                      </div>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, syncEnabled: !prev.syncEnabled }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.syncEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {formData.syncEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sync Frequency
                        </label>
                        <select
                          value={formData.syncFrequency}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            syncFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'manual'
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Credentials */}
            {step === 'credentials' && selectedProgram && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Secure Sync Setup</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your login credentials will be encrypted and stored securely. We use bank-level security to protect your information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username/Email *
                    </label>
                    <input
                      type="text"
                      placeholder="Your login username or email"
                      value={formData.credentials.username || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        credentials: { ...prev.credentials, username: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Your account password"
                        value={formData.credentials.password || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          credentials: { ...prev.credentials, password: e.target.value }
                        }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Added Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Your {selectedProgram?.name} account has been added and will start syncing shortly.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={step === 'search' ? handleClose : () => {
                  if (step === 'details') setStep('search');
                  if (step === 'credentials') setStep('details');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                {step === 'search' ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={() => {
                  if (step === 'details') handleDetailsSubmit();
                  if (step === 'credentials') handleCredentialsSubmit();
                }}
                disabled={loading || step === 'search'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 'details' && (formData.syncEnabled ? 'Next' : 'Create Account')}
                {step === 'credentials' && 'Create Account'}
                {loading && 'Creating...'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
