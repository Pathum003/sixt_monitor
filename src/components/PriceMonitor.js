'use client';
import React, { useState } from 'react';

export default function LocationFinder() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLocations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/check-price', {
        method: 'POST'
      });

      const data = await response.json();
      console.log('Response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setLocations(data.branches || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Sixt Locations Near North Hollywood</h2>
      
      <button 
        className={`px-4 py-2 rounded text-white w-full mb-4
          ${isLoading 
            ? 'bg-blue-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        onClick={checkLocations}
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Check Nearby Locations'}
      </button>

      {error && (
        <div className="text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {locations.length > 0 && (
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-bold">{location.title}</h3>
              <p className="text-sm text-gray-600">{location.description}</p>
              <p className="text-sm mt-2">
                Distance: {location.distance?.distance} {location.distance?.distance_unit.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}