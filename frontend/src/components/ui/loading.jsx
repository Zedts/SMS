import React from 'react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ className, size = "default" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8", 
    large: "h-12 w-12"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-pink-600", sizeClasses[size], className)} />
  );
};

const LoadingPage = ({ message = "Memuat...", submessage }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <LoadingSpinner size="large" className="relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">{message}</h2>
          {submessage && (
            <p className="text-gray-600">{submessage}</p>
          )}
        </div>
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingCard = ({ message = "Memuat...", className }) => {
  return (
    <div className={cn("min-h-[60vh] flex items-center justify-center", className)}>
      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="text-white text-lg font-medium">{message}</p>
        <p className="text-pink-200 text-sm mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingPage, LoadingCard };
