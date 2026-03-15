'use client';

import React from 'react';

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullscreen = true
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      {/* Kitchen-themed loading animation */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-ada-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-ada-500">KDS</span>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h2>
      
      <p className="text-gray-600 text-center max-w-md">
        Connecting to kitchen systems...
      </p>
      
      {/* Loading dots */}
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 bg-ada-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-ada-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-ada-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};