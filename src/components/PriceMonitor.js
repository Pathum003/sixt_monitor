'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceMonitor() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkLocations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/check-price', {
        method: 'POST'
      });

      const data = await response.json();
      console.log('Raw API Response:', data);  // For debugging
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLocations(data.branches || []);
      setLastCheck(new Date());
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Sixt Location Finder</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        <div className="mb-4">
          <button 
            className={`px-4 py-2 rounded text-white w-full
              ${isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
            onClick={checkLocations}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Find Nearby Locations'}
          </button>
        </div>

        {lastCheck && (
          <div className="text-sm text-gray-500 mb-4">
            Last checked: {lastCheck.toLocaleString()}
          </div>
        )}

        {locations.length > 0 && (
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="font-semibold">{location.title}</div>
                <div className="text-sm text-gray-600">{location.formatted_address}</div>
                <div className="text-sm mt-2">
                  Distance: {location.distance?.distance} {location.distance?.distance_unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}