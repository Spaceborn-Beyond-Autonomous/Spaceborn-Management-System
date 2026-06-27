import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendValue, 
  color,
  onClick 
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer animate-fadeIn"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]} transition-all group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
      {trend && (
        <div className={`flex items-center space-x-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};