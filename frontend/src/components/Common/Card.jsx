import React from 'react';
import { MoreVertical } from 'lucide-react';

export const Card = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '', 
  onMoreClick,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
        {onMoreClick && (
          <button 
            onClick={onMoreClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};