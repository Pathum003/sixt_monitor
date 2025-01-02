import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export const config = {
  maxDuration: 300,
};

export async function POST() {
  let browser = null;
  
  try {
    // Configure browser options
    const executablePath = await chromium.executablePath;

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // The URL with your search parameters
    const url = 'https://www.sixt.com/betafunnel/#/nearbybranches?zen_pu_location=6c44c18c-3860-41bc-a661-931855a3afcf&zen_do_location=6c44c18c-3860-41bc-a661-931855a3afcf&zen_pu_title=North%20Hollywood%2C%20CA%2091602%2C%20USA&zen_do_title=North%20Hollywood%2C%20CA%2091602%2C%20USA&zen_pu_time=2025-01-09T12%3A30&zen_do_time=2025-02-05T12%3A30';
    
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Extract location data
    const locations = await page.evaluate(() => {
      const branches = document.querySelectorAll('[data-testid="branch-list"] > div');
      return Array.from(branches).map(branch => {
        const titleElement = branch.querySelector('h3');
        const priceElement = branch.querySelector('[data-testid="price"]');
        const addressElement = branch.querySelector('address');
        
        return {
          title: titleElement ? titleElement.textContent?.trim() : '',
          price: priceElement ? priceElement.textContent?.trim() : '',
          address: addressElement ? addressElement.textContent?.trim() : '',
          timestamp: new Date().toISOString()
        };
      });
    });

    // Sort by price and get top 3 cheapest
    const sortedLocations = locations
      .filter(loc => loc.price)
      .sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
        return priceA - priceB;
      })
      .slice(0, 3);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json({ 
      locations: sortedLocations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scraping Error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}