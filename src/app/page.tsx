/**
 * BTC Dashboard - Main Page (Placeholder)
 * Nagatha will build out the full UI
 */

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        ₿ BTC Dashboard
      </h1>
      
      <div className="grid gap-4 text-center">
        <p className="text-gray-400">
          Backend API ready. Frontend coming soon...
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
          <ul className="text-left space-y-2 text-sm text-gray-300">
            <li>✅ <code>/api/price</code> - Current BTC price</li>
            <li>✅ <code>/api/fear-greed</code> - Fear & Greed Index</li>
            <li>✅ <code>/api/network</code> - Network stats</li>
            <li>✅ <code>/api/history?days=30</code> - Price history</li>
            <li>✅ <code>/api/news</code> - Bitcoin news</li>
            <li>✅ <code>/api/dashboard</code> - All data combined</li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Built by Skippy the Magnificent 🍺 & Nagatha
        </p>
      </div>
    </main>
  );
}
