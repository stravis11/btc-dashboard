/**
 * Quick API test script
 * Run with: npx tsx test-api.ts
 */

import {
  fetchBtcPrice,
  fetchFearGreed,
  fetchNetworkStats,
  fetchNews,
  fetchPriceHistory,
} from './src/lib/api';

async function testAPIs() {
  console.log('🍺 Skippy API Test Suite\n');
  console.log('='.repeat(50));

  try {
    console.log('\n📊 Testing Bitcoin Price...');
    const price = await fetchBtcPrice();
    console.log(`  Price: $${price.price.toLocaleString()}`);
    console.log(`  24h Change: ${price.price_change_percentage_24h.toFixed(2)}%`);
    console.log(`  Market Cap: $${(price.market_cap / 1e9).toFixed(2)}B`);
    console.log('  ✅ Price API working\n');

    console.log('😰 Testing Fear & Greed Index...');
    const fg = await fetchFearGreed();
    console.log(`  Current: ${fg.current.value} (${fg.current.value_classification})`);
    console.log(`  History: ${fg.history.length} days`);
    console.log('  ✅ Fear & Greed API working\n');

    console.log('⛓️ Testing Network Stats...');
    const network = await fetchNetworkStats();
    console.log(`  Block Height: ${network.block_height.toLocaleString()}`);
    console.log(`  Hash Rate: ${network.hash_rate.toFixed(2)} EH/s`);
    console.log(`  Blocks to Halving: ${network.blocks_until_halving.toLocaleString()}`);
    console.log(`  Est. Halving: ${new Date(network.estimated_halving_date).toLocaleDateString()}`);
    console.log('  ✅ Network API working\n');

    console.log('📰 Testing News...');
    const news = await fetchNews(3);
    if (news.length > 0) {
      news.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.title.slice(0, 60)}...`);
      });
      console.log('  ✅ News API working\n');
    } else {
      console.log('  ⚠️ News API returned empty (may need auth token)\n');
    }

    console.log('📈 Testing Price History...');
    const history = await fetchPriceHistory(7);
    console.log(`  7-day history: ${history.length} data points`);
    console.log(`  First: $${history[0]?.price.toFixed(2)} @ ${new Date(history[0]?.timestamp).toLocaleDateString()}`);
    console.log(`  Last: $${history[history.length-1]?.price.toFixed(2)} @ ${new Date(history[history.length-1]?.timestamp).toLocaleDateString()}`);
    console.log('  ✅ History API working\n');

    console.log('='.repeat(50));
    console.log('🍺 All APIs tested successfully!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAPIs();
