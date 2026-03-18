export default function DemoBanner() {
  return (
    <div className="mb-8 border border-yellow-500/30 bg-yellow-500/5 rounded overflow-hidden">
      <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
        <span className="text-yellow-400 text-sm">⚠</span>
        <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider font-heading">
          Demo Mode — Sample Data
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-yellow-500/20">

        {/* Left: what this means */}
        <div className="px-5 py-4">
          <p className="text-yellow-200 text-sm font-semibold mb-2">What you're seeing</p>
          <p className="text-yellow-200/70 text-xs leading-relaxed mb-3">
            The middleware is not reachable, so this page is showing four built-in sample tokens.
            Nothing here is on a real chain — it's a preview of what a live wallet would show.
          </p>
          <p className="text-yellow-200/70 text-xs leading-relaxed">
            Token creation is disabled in demo mode. To mint real tokens you need the full local stack running.
          </p>
        </div>

        {/* Right: how to go live */}
        <div className="px-5 py-4">
          <p className="text-yellow-200 text-sm font-semibold mb-3">How to switch to live mode</p>
          <ol className="space-y-2 text-xs text-yellow-200/70">
            <li className="flex gap-2">
              <span className="text-yellow-400 font-mono font-bold shrink-0">1.</span>
              <span>Start <code className="text-yellow-100 bg-black/30 px-1 rounded">salviumd --testnet --offline --fixed-difficulty 500</code></span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 font-mono font-bold shrink-0">2.</span>
              <span>Start <code className="text-yellow-100 bg-black/30 px-1 rounded">salvium-wallet-rpc</code> with your demo wallet on port <code className="text-yellow-100 bg-black/30 px-1 rounded">29088</code></span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 font-mono font-bold shrink-0">3.</span>
              <span>Run the middleware:</span>
            </li>
          </ol>
          <pre className="mt-2 text-xs bg-black/40 text-yellow-100 px-3 py-2 rounded font-mono leading-relaxed overflow-x-auto">
{`cd salvium/middleware
RPC_URL=http://127.0.0.1:29088/json_rpc \\
RPC_USER=1 RPC_PASS=1 PORT=3001 \\
npx tsx src/server.ts`}
          </pre>
          <p className="text-yellow-200/50 text-xs mt-2">Then refresh this page — the banner disappears when the middleware is reachable.</p>
        </div>
      </div>
    </div>
  );
}
