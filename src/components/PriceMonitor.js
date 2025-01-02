'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TELEGRAM_BOT_TOKEN = '7446147421:AAEYdJVUpKmk7VM04DIl3Rm9iRo8BpDli5g';
const TELEGRAM_CHAT_ID = '391609613';
const TARGET_PRICE = 800; // Alert if price drops below this
const PRICE_CHANGE_THRESHOLD = 50; // Alert if price changes by this amount

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

const PriceMonitor = () => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const shouldNotify = (newPrice, oldPrice) => {
    if (!oldPrice) return false; // Don't notify on first price check
    
    return (
      newPrice < TARGET_PRICE || // Price is below target
      Math.abs(newPrice - oldPrice) >= PRICE_CHANGE_THRESHOLD // Price changed significantly
    );
  };

  const checkPrice = async () => {
    setIsLoading(true);
    try {
      // For testing, using simulated prices around $840 (based on your actual API response)
      const basePrice = 840.63;
      const variation = Math.random() * 100 - 50; // Random variation +/- $50
      const newPrice = basePrice + variation;
      
      const now = new Date();
      
      // Check if we should send notification
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

  // Initialize price checking
  useEffect(() => {
    checkPrice(); // Initial check
    
    // Set up periodic checking every 6 hours
    const interval = setInterval(checkPrice, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>BMW 5 Series Price Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
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
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={['auto', 'auto']}
              />
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
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          onClick={checkPrice}
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Check Price Now'}
        </button>
      </CardContent>
    </Card>
  );
};

export default PriceMonitor;