# BTC Dashboard 🍺

A real-time Bitcoin dashboard showing price, Fear & Greed Index, network stats, and more.

**Built by Skippy the Magnificent & Nagatha**

## Features

- ✅ Live BTC/USD price with 24h change
- ✅ Market cap and trading volume
- ✅ Fear & Greed Index (current + 30-day history)
- ✅ Network stats (block height, hash rate, difficulty)
- ✅ Halving countdown
- ✅ Price history charts (7d, 30d, 90d)
- ✅ News headlines (needs API key for full access)
- ✅ Dark mode by default
- ✅ Mobile-responsive

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **APIs:** CoinGecko (free), Alternative.me, Blockchain.com
- **Deployment:** Vercel (free tier)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/price` | Current BTC price, 24h stats, market cap |
| `/api/fear-greed` | Fear & Greed Index + 30-day history |
| `/api/network` | Block height, hash rate, halving countdown |
| `/api/history?days=30` | Price history (7, 30, 90, 365 days) |
| `/api/news?limit=5` | Bitcoin news headlines |
| `/api/dashboard` | All data combined (single request) |

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Test API functions
npm run test-api
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Or connect your GitHub repo to Vercel for automatic deploys.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── dashboard/ # Aggregated data
│   │   ├── fear-greed/
│   │   ├── history/
│   │   ├── network/
│   │   ├── news/
│   │   └── price/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx       # Main dashboard (WIP)
└── lib/
    └── api.ts         # API integration layer
```

## Status

- [x] Backend API complete
- [ ] Frontend UI (Nagatha building)
- [ ] Charts integration
- [ ] News API enhancement
- [ ] Deploy to Vercel

---

*Built with caffeine and magnificence.* 🍺
