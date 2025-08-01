'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import CardRecommendation from './CardRecommendation';

const CATEGORIES = [
  'dining',
  'groceries',
  'gas',
  'travel',
  'entertainment',
  'shopping',
  'utilities',
  'other',
];

interface RecommendationFormData {
  amount: number;
  merchant: string;
  category: string;
}

export default function RecommendationForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<RecommendationFormData>();

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Get Card Recommendation
      </h2>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Transaction Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="amount"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-gray-700">
              Merchant Name
            </label>
            <input
              type="text"
              id="merchant"
              {...register('merchant', { required: 'Merchant name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
            {errors.merchant && (
              <p className="mt-1 text-sm text-red-600">{errors.merchant.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              {...register('category', { required: 'Category is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Get Recommendation
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <CardRecommendation {...getValues()} />
          <button
            onClick={() => setSubmitted(false)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Start New Request
          </button>
        </div>
      )}
    </div>
  );
}
