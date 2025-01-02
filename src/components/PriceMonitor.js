'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TELEGRAM_BOT_TOKEN = '7446147421:AAEYdJVUpKmk7VM04DIl3Rm9iRo8BpDli5g';
const TELEGRAM_CHAT_ID = '391609613';
const TARGET_PRICE = 800;
const PRICE_CHANGE_THRESHOLD = 50;

async function sendTelegramAlert(message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    const data = await response.json();
    console.log('Telegram API response:', data);
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
}

export default function PriceMonitor() {
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const shouldNotify = (newPrice, oldPrice) => {
    if (!oldPrice) return false;
    return (
      newPrice < TARGET_PRICE ||
      Math.abs(newPrice - oldPrice) >= PRICE_CHANGE_THRESHOLD
    );
  };

  const checkPrice = async () => {
    setIsLoading(true);
    try {
      const basePrice = 840.63;
      const variation = Math.random() * 100 - 50;
      const newPrice = basePrice + variation;
      
      const now = new Date();
      
      if (shouldNotify(newPrice, currentPrice)) {
        const message = `🚨 BMW 5 Series Price Alert!\n\n` +
          `Previous Price: $${currentPrice?.toFixed(2) || 'N/A'}\n` +
          `New Price: $${newPrice.toFixed(2)}\n` +
          `Change: ${currentPrice ? `$${(newPrice - currentPrice).toFixed(2)}` : 'N/A'}\n\n` +
          `Checked at: ${now.toLocaleString()}`;
        
        await sendTelegramAlert(message);
      }
      
      setLastCheck(now);
      setCurrentPrice(newPrice);
      
      setPriceHistory(prev => [...prev, {
        timestamp: now.toLocaleString(),
        price: newPrice
      }]);
      
    } catch (error) {
      console.error('Error checking price:', error);
      await sendTelegramAlert(`❌ Error checking BMW 5 Series price: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPrice();
    const interval = setInterval(checkPrice, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">BMW 5 Series Price Monitor</h2>
        <div className="text-lg mb-2">
          Current Price: ${currentPrice?.toFixed(2) || 'Loading...'}
        </div>
        <div className="text-sm text-gray-500">
          Last checked: {lastCheck?.toLocaleString() || 'Never'}
        </div>
        <div className="text-sm text-gray-500">
          Target Price: ${TARGET_PRICE} | Alert on change: ${PRICE_CHANGE_THRESHOLD}
        </div>
      </div>
      
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
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button 
        className={`px-4 py-2 rounded text-white 
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