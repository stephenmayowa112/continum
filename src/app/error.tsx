'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Something went wrong</h1>
        <p className="text-gray-700 mb-6">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
