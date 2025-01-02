'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TELEGRAM_BOT_TOKEN = '7446147421:AAEYdJVUpKmk7VM04DIl3Rm9iRo8BpDli5g';
const TELEGRAM_CHAT_ID = '391609613';

export default function PriceMonitor() {
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const rentalDetails = {
    pickupDate: "2025-01-07T12:30",
    returnDate: "2025-02-03T12:30",
    days: 27,
    location: {
      name: "Pasadena Downtown",
      address: "350 W Colorado Blvd, Pasadena, 91105-1808, US",
      id: "cd39902b-c6cb-4f8-bece-1103f0ab192d"
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const checkPrice = async () => {
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

      const bmw5Series = data.offers?.find(offer => 
        offer.car_info.title.includes("BMW 5")
      );
      
      if (!bmw5Series) {
        throw new Error('BMW 5 Series not found in offers');
      }

      const newPrice = bmw5Series.price_total.gross.value;
      const now = new Date();
      
      // Send Telegram notification
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🚨 BMW 5 Series\nPrice: $${newPrice.toFixed(2)}\nPer day: $${(newPrice / rentalDetails.days).toFixed(2)}\nLocation: ${rentalDetails.location.name}\nChecked: ${now.toLocaleString()}`
        })
      });
      
      setLastCheck(now);
      setCurrentPrice(newPrice);
      setPriceHistory(prev => [...prev, {
        timestamp: now.toLocaleString(),
        price: newPrice,
        pricePerDay: newPrice / rentalDetails.days
      }]);
      
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
        <h2 className="text-2xl font-bold mb-4">BMW 5 Series Price Monitor</h2>
        
        <div className="grid gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Rental Details</h3>
            <div className="grid gap-2">
              <div className="border-b pb-2">
                <div className="font-medium">Location</div>
                <div className="text-sm">{rentalDetails.location.name}</div>
                <div className="text-xs text-gray-600">{rentalDetails.location.address}</div>
              </div>
              <div>
                <div>Pickup: {formatDate(rentalDetails.pickupDate)}</div>
                <div>Return: {formatDate(rentalDetails.returnDate)}</div>
                <div>Duration: {rentalDetails.days} days</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Current Price</h3>
            <div className="text-2xl font-bold mb-1">
              ${currentPrice?.toFixed(2) || 'Not checked yet'}
            </div>
            {currentPrice && (
              <div className="text-sm text-gray-600">
                ${(currentPrice / rentalDetails.days).toFixed(2)} per day
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 mt-2">
                Error: {error}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Last checked: {lastCheck?.toLocaleString() || 'Never'}
          </div>
        </div>
      </div>
      
      {priceHistory.length > 0 && (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb"
                strokeWidth={2}
                name="Total Price"
              />
              <Line 
                type="monotone" 
                dataKey="pricePerDay" 
                stroke="#10b981"
                strokeWidth={2}
                name="Price per Day"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button 
        className={`px-4 py-2 rounded text-white w-full
          ${isLoading 
            ? 'bg-blue-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        onClick={checkPrice}
        disabled={isLoading}
      >
        {isLoading ? 'Checking...' : 'Check Price Now'}
      </button>
    </div>
  );
}