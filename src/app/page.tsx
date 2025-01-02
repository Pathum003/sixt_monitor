'use client';
import React from 'react';
import PriceMonitor from '../components/PriceMonitor';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <PriceMonitor />
      </div>
    </div>
  );
}