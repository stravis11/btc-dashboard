/**
 * BTC Dashboard - API Integration Layer
 * Built by Skippy the Magnificent 🍺
 */

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// CoinGecko API - Bitcoin Price Data
// ============================================

export interface PriceData {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  last_updated: string;
}

export async function fetchBtcPrice(): Promise<PriceData> {
  const cached = getCached<PriceData>('btc_price');
  if (cached) return cached;

  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false'
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const result: PriceData = {
    price: data.market_data.current_price.usd,
    price_change_24h: data.market_data.price_change_24h,
    price_change_percentage_24h: data.market_data.price_change_percentage_24h,
    high_24h: data.market_data.high_24h.usd,
    low_24h: data.market_data.low_24h.usd,
    market_cap: data.market_data.market_cap.usd,
    total_volume: data.market_data.total_volume.usd,
    circulating_supply: data.market_data.circulating_supply,
    last_updated: data.last_updated,
  };

  setCache('btc_price', result);
  return result;
}

// ============================================
// Price History (CoinGecko)
// ============================================

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
}

export async function fetchPriceHistory(days: number = 30): Promise<PriceHistoryPoint[]> {
  const cacheKey = `price_history_${days}`;
  const cached = getCached<PriceHistoryPoint[]>(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const result: PriceHistoryPoint[] = data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price,
  }));

  setCache(cacheKey, result);
  return result;
}

// ============================================
// Fear & Greed Index (alternative.me)
// ============================================

export interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: number;
}

export interface FearGreedResponse {
  current: FearGreedData;
  history: FearGreedData[];
}

export async function fetchFearGreed(): Promise<FearGreedResponse> {
  const cached = getCached<FearGreedResponse>('fear_greed');
  if (cached) return cached;

  const response = await fetch(
    'https://api.alternative.me/fng/?limit=31'
  );

  if (!response.ok) {
    throw new Error(`Alternative.me API error: ${response.status}`);
  }

  const data = await response.json();
  const entries = data.data.map((item: { value: string; value_classification: string; timestamp: string }) => ({
    value: parseInt(item.value, 10),
    value_classification: item.value_classification,
    timestamp: parseInt(item.timestamp, 10) * 1000, // Convert to ms
  }));

  const result: FearGreedResponse = {
    current: entries[0],
    history: entries,
  };

  setCache('fear_greed', result);
  return result;
}

// ============================================
// Bitcoin Network Stats (Blockchain.com)
// ============================================

export interface NetworkStats {
  block_height: number;
  hash_rate: number; // EH/s (Exahashes per second)
  difficulty: number;
  blocks_until_halving: number;
  estimated_halving_date: string;
  avg_block_time: number; // seconds
}

// Halving occurs every 210,000 blocks
const HALVING_INTERVAL = 210000;
const NEXT_HALVING_BLOCK = 1050000; // Block 1,050,000 (5th halving)

export async function fetchNetworkStats(): Promise<NetworkStats> {
  const cached = getCached<NetworkStats>('network_stats');
  if (cached) return cached;

  // Fetch multiple stats from blockchain.com
  const [heightRes, hashRateRes, difficultyRes] = await Promise.all([
    fetch('https://blockchain.info/q/getblockcount'),
    fetch('https://blockchain.info/q/hashrate'),
    fetch('https://blockchain.info/q/getdifficulty'),
  ]);

  if (!heightRes.ok || !hashRateRes.ok || !difficultyRes.ok) {
    throw new Error('Blockchain.info API error');
  }

  const blockHeight = parseInt(await heightRes.text(), 10);
  const hashRateRaw = parseFloat(await hashRateRes.text());
  // Blockchain.info returns GH/s, convert to EH/s for readability
  const hashRate = hashRateRaw / 1e9; // Convert GH/s to EH/s
  const difficulty = parseFloat(await difficultyRes.text());

  // Calculate halving info
  const blocksUntilHalving = NEXT_HALVING_BLOCK - blockHeight;
  const avgBlockTime = 10 * 60; // ~10 minutes in seconds
  const secondsUntilHalving = blocksUntilHalving * avgBlockTime;
  const halvingDate = new Date(Date.now() + secondsUntilHalving * 1000);

  const result: NetworkStats = {
    block_height: blockHeight,
    hash_rate: hashRate,
    difficulty,
    blocks_until_halving: blocksUntilHalving,
    estimated_halving_date: halvingDate.toISOString(),
    avg_block_time: avgBlockTime,
  };

  setCache('network_stats', result);
  return result;
}

// ============================================
// Bitcoin News (CryptoPanic - free tier)
// ============================================

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export async function fetchNews(limit: number = 5): Promise<NewsItem[]> {
  const cached = getCached<NewsItem[]>('news');
  if (cached) return cached.slice(0, limit);

  try {
    // Use CoinGecko's news endpoint (free, no API key needed)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/news?per_page=10'
    );

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const result: NewsItem[] = data.data
          .filter((item: { title?: string }) => 
            item.title?.toLowerCase().includes('bitcoin') || 
            item.title?.toLowerCase().includes('btc') ||
            item.title?.toLowerCase().includes('crypto')
          )
          .slice(0, 10)
          .map((item: {
            title: string;
            url: string;
            news_site: string;
            created_at: string;
          }) => ({
            title: item.title,
            url: item.url,
            source: item.news_site || 'CoinGecko News',
            published_at: item.created_at,
          }));
        
        if (result.length > 0) {
          setCache('news', result);
          return result.slice(0, limit);
        }
      }
    }
  } catch (e) {
    console.error('News fetch error:', e);
  }

  // Fallback: Return empty array - frontend will hide the section
  return [];
}

// ============================================
// Aggregated Dashboard Data
// ============================================

export interface DashboardData {
  price: PriceData;
  fearGreed: FearGreedResponse;
  network: NetworkStats;
  news: NewsItem[];
  priceHistory: {
    '7d': PriceHistoryPoint[];
    '30d': PriceHistoryPoint[];
    '90d': PriceHistoryPoint[];
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [price, fearGreed, network, news, history7d, history30d, history90d] = await Promise.all([
    fetchBtcPrice(),
    fetchFearGreed(),
    fetchNetworkStats(),
    fetchNews(5),
    fetchPriceHistory(7),
    fetchPriceHistory(30),
    fetchPriceHistory(90),
  ]);

  return {
    price,
    fearGreed,
    network,
    news,
    priceHistory: {
      '7d': history7d,
      '30d': history30d,
      '90d': history90d,
    },
  };
}
