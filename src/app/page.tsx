'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardData {
  price: {
    price: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    high_24h: number;
    low_24h: number;
    market_cap: number;
    total_volume: number;
    circulating_supply: number;
    last_updated: string;
  };
  fearGreed: {
    current: {
      value: number;
      value_classification: string;
    };
    avg_7d: number;
    avg_30d: number;
    avg_90d: number;
  };
  network: {
    hash_rate: number;
    difficulty: number;
    block_height: number;
    blocks_until_halving: number;
    estimated_halving_date: string;
    avg_block_time: number;
  };
  history: Array<{ timestamp: number; price: number }>;
  news: Array<{ title: string; url: string; source: string; published_at: string }>;
}

type HistoryPeriod = '24h' | '7d' | '30d' | '90d' | '180d' | '1y';
const HISTORY_OPTIONS: { label: string; value: HistoryPeriod; days: number }[] = [
  { label: '24H', value: '24h', days: 1 },
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '180D', value: '180d', days: 180 },
  { label: '1Y', value: '1y', days: 365 },
  // Note: 'ALL' removed - CoinGecko free tier limited to 365 days
];

function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatHashRate(hash: number): string {
  if (hash >= 1e18) return (hash / 1e18).toFixed(2) + ' EH/s';
  if (hash >= 1e15) return (hash / 1e15).toFixed(2) + ' PH/s';
  if (hash >= 1e12) return (hash / 1e12).toFixed(2) + ' TH/s';
  return hash.toFixed(2) + ' H/s';
}

function getFearGreedColor(value: number): string {
  if (value <= 25) return '#ea3943'; // Extreme Fear - Red
  if (value <= 45) return '#ea8c00'; // Fear - Orange
  if (value <= 55) return '#f3d42f'; // Neutral - Yellow
  if (value <= 75) return '#93d900'; // Greed - Light Green
  return '#16c784'; // Extreme Greed - Green
}

function getFearGreedEmoji(value: number): string {
  if (value <= 25) return '😱';
  if (value <= 45) return '😰';
  if (value <= 55) return '😐';
  if (value <= 75) return '😏';
  return '🤑';
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('30d');
  
  const historyDays = HISTORY_OPTIONS.find(o => o.value === historyPeriod)?.days || 30;

  // Initial data fetch
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [dashRes, historyRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch(`/api/history?days=30`)
        ]);
        
        if (!dashRes.ok || !historyRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const dashData = await dashRes.json();
        const historyData = await historyRes.json();
        
        setData({ ...dashData, history: Array.isArray(historyData) ? historyData : historyData.prices || [] });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchInitialData();
    const interval = setInterval(fetchInitialData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Update history when period changes
  useEffect(() => {
    if (loading) return; // Don't fetch while initial load is happening
    
    async function fetchHistory() {
      try {
        const historyRes = await fetch(`/api/history?days=${historyDays}`);
        if (!historyRes.ok) throw new Error('Failed to fetch history');
        const historyData = await historyRes.json();
        setData(prev => prev ? { ...prev, history: Array.isArray(historyData) ? historyData : historyData.prices || [] } : null);
      } catch (err) {
        console.error('History fetch error:', err);
      }
    }

    fetchHistory();
  }, [historyPeriod, historyDays, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Bitcoin data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-2xl mb-2">⚠️ Error</p>
          <p>{error || 'Failed to load data'}</p>
        </div>
      </div>
    );
  }

  const priceChange = data.price.price_change_percentage_24h;
  const isUp = priceChange >= 0;

  const chartData = {
    labels: data.history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'BTC Price',
        data: data.history.map(h => h.price),
        borderColor: '#f7931a',
        backgroundColor: 'rgba(247, 147, 26, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#f7931a',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f7931a',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (ctx: { raw: unknown }) => `$${(ctx.raw as number).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af', maxTicksLimit: 8 },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#9ca3af',
          callback: (value: unknown) => '$' + formatNumber(value as number),
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">₿</span>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            Bitcoin Dashboard
          </h1>
        </div>
        <p className="text-gray-500 text-sm">
          Last updated: {new Date(data.price.last_updated).toLocaleString()}
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Price Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 col-span-1 md:col-span-2">
          <p className="text-gray-400 text-sm mb-1">Bitcoin Price</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-bold">
              ${data.price.price.toLocaleString()}
            </span>
            <span className={`text-lg font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-500">24h High:</span>
              <span className="text-green-400 ml-2">${data.price.high_24h.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">24h Low:</span>
              <span className="text-red-400 ml-2">${data.price.low_24h.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Fear & Greed Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 col-span-1 md:col-span-2">
          <p className="text-gray-400 text-sm mb-3">Fear & Greed Index</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{getFearGreedEmoji(data.fearGreed.current.value)}</span>
            <div>
              <span 
                className="text-4xl font-bold"
                style={{ color: getFearGreedColor(data.fearGreed.current.value) }}
              >
                {data.fearGreed.current.value}
              </span>
              <p 
                className="text-sm font-medium"
                style={{ color: getFearGreedColor(data.fearGreed.current.value) }}
              >
                {data.fearGreed.current.value_classification}
              </p>
            </div>
          </div>
          {/* Fear/Greed Bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${data.fearGreed.current.value}%`,
                background: `linear-gradient(90deg, #ea3943, #f3d42f, #16c784)`,
              }}
            />
          </div>
          {/* Historical Averages */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">7D Avg</p>
              <p className="text-lg font-bold" style={{ color: getFearGreedColor(data.fearGreed.avg_7d) }}>
                {data.fearGreed.avg_7d}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">30D Avg</p>
              <p className="text-lg font-bold" style={{ color: getFearGreedColor(data.fearGreed.avg_30d) }}>
                {data.fearGreed.avg_30d}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">90D Avg</p>
              <p className="text-lg font-bold" style={{ color: getFearGreedColor(data.fearGreed.avg_90d) }}>
                {data.fearGreed.avg_90d}
              </p>
            </div>
          </div>
        </div>

        {/* Market Cap Card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Market Cap</p>
          <p className="text-3xl font-bold text-orange-400">
            ${formatNumber(data.price.market_cap)}
          </p>
          <div className="mt-3 text-sm">
            <span className="text-gray-500">Volume 24h:</span>
            <span className="text-white ml-2">${formatNumber(data.price.total_volume)}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="text-xl font-semibold">Price History</h2>
          <div className="flex gap-1 flex-wrap">
            {HISTORY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setHistoryPeriod(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  historyPeriod === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 md:h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Network Stats & Halving */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Network Stats */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Network Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Hash Rate</span>
              <span className="font-mono text-orange-400">
                {formatHashRate(data.network.hash_rate * 1e18)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Difficulty</span>
              <span className="font-mono">{formatNumber(data.network.difficulty)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Block Height</span>
              <span className="font-mono text-green-400">
                #{data.network.block_height.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="font-mono">
                {formatNumber(data.price.circulating_supply)} BTC
              </span>
            </div>
          </div>
        </div>

        {/* Halving Countdown */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">⏱️ Next Halving</h2>
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-400 mb-2">
              {Math.floor(data.network.blocks_until_halving * data.network.avg_block_time / 86400)}
            </p>
            <p className="text-gray-400 text-lg mb-4">days remaining</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                Block #{(data.network.block_height + data.network.blocks_until_halving).toLocaleString()}
              </p>
              <p>
                ~{data.network.blocks_until_halving.toLocaleString()} blocks to go
              </p>
              <p className="text-orange-400">
                Est. {new Date(data.network.estimated_halving_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bitcoin News */}
      {data.news && data.news.length > 0 && data.news[0].source !== 'Setup Required' && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold mb-4">📰 Bitcoin News</h2>
          <div className="space-y-4">
            {data.news.slice(0, 5).map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-white font-medium mb-1 line-clamp-2">{item.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{item.source}</span>
                  <span>{new Date(item.published_at).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm">
        <p>Built by Skippy the Magnificent 🍺 & Nagatha</p>
        <p className="mt-1">Data from CoinGecko, Alternative.me, Blockchain.com</p>
      </footer>
    </div>
  );
}
