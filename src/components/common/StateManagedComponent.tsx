import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface StateManagedComponentProps {
  loading: boolean;
  error: string | null;
  data: any[] | null | undefined;
  emptyMessage: string;
  errorMessagePrefix?: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export default function StateManagedComponent({
  loading,
  error,
  data,
  emptyMessage,
  errorMessagePrefix = 'An error occurred',
  children,
  loadingComponent,
  emptyComponent,
}: StateManagedComponentProps) {
  if (loading) {
    return <>{loadingComponent || <LoadingSpinner />}</>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700">{`${errorMessagePrefix}: ${error}`}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        {emptyComponent || (
          <div className="text-center py-12">
            <p className="text-gray-600">{emptyMessage}</p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
