'use client';
import React, { useState } from 'react';

export default function PriceMonitor() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkPrices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/check-price', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Sort locations by price
      const sortedLocations = (data.branches || [])
        .filter(branch => branch.cheapest_offer_price)
        .map(branch => ({
          name: branch.title,
          address: branch.description,
          price: branch.cheapest_offer_price.gross.value,
          distance: branch.distance?.distance || 'N/A'
        }))
        .sort((a, b) => a.price - b.price);

      setLocations(sortedLocations);
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
        <h2 className="text-2xl font-bold mb-4">Sixt Nearby Location Prices</h2>
        
        <div className="grid gap-4 mb-6">
          {locations.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Best Price</h3>
              <div className="text-2xl font-bold mb-1">
                ${locations[0].price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                at {locations[0].name}
              </div>
              <div className="text-xs text-gray-500">
                {locations[0].address}
              </div>
              <div className="text-xs text-gray-500">
                Distance: {locations[0].distance} miles
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-500">
            Last checked: {lastCheck?.toLocaleString() || 'Never'}
          </div>
        </div>

        {locations.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">All Locations</h3>
            <div className="grid gap-3">
              {locations.map((loc, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">${loc.price.toFixed(2)}</div>
                  <div className="text-sm">{loc.name}</div>
                  <div className="text-xs text-gray-600">{loc.address}</div>
                  <div className="text-xs text-gray-500">Distance: {loc.distance} miles</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        className={`px-4 py-2 rounded text-white w-full
          ${isLoading 
            ? 'bg-blue-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        onClick={checkPrices}
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Check Prices Now'}
      </button>
    </div>
  );
}