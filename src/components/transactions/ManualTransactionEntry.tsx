'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  FileText, 
  Tag,
  CreditCard,
  X,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Removed unused Alert components
import { useTransactionStore } from '@/stores/transactionStore';
import { TransactionSource, TRANSACTION_CATEGORIES } from '@/types/transactions';

interface ManualTransactionEntryProps {
  onTransactionAdded?: () => void;
  onCancel?: () => void;
}

export default function ManualTransactionEntry({ 
  onTransactionAdded, 
  onCancel 
}: ManualTransactionEntryProps) {
  const { addTransaction } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    merchantName: '',
    category: '',
    subcategory: '',
    paymentMethod: '',
    notes: '',
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      
      addTransaction({
        userId: 'current-user', // Replace with actual user ID
        amount,
        description: formData.description,
        merchantName: formData.merchantName || undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        date: new Date(formData.date).toISOString(),
        pending: false,
        source: TransactionSource.MANUAL_ENTRY,
        paymentMethod: formData.paymentMethod || undefined,
        tags: formData.tags,
        notes: formData.notes || undefined
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        merchantName: '',
        category: '',
        subcategory: '',
        paymentMethod: '',
        notes: '',
        tags: []
      });

      onTransactionAdded?.();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const categoryOptions = Object.keys(TRANSACTION_CATEGORIES);
  const subcategoryOptions = formData.category 
    ? TRANSACTION_CATEGORIES[formData.category as keyof typeof TRANSACTION_CATEGORIES] || []
    : [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Transaction Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 ${
                  errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Amount * (negative for expenses)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="-25.99"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Description *
            </label>
            <input
              type="text"
              placeholder="Coffee at Starbucks"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Merchant Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Merchant/Business Name
            </label>
            <input
              type="text"
              placeholder="Starbucks"
              value={formData.merchantName}
              onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value,
                  subcategory: '' // Reset subcategory when category changes
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 ${
                  errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                disabled={!formData.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="">Select Subcategory</option>
                {subcategoryOptions.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Payment">Mobile Payment</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              placeholder="Additional notes about this transaction..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Add Transaction
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
