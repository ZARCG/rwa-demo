import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTokens, getToken, type TokenInfo } from '../api';
import DemoBanner from '../components/DemoBanner';

// ── Token type metadata ──────────────────────────────────────

const STANDARDS: Record<string, { label: string; colour: string; desc: string }> = {
  'ERC-721':  { label: 'ERC-721',  colour: 'text-purple-400 bg-purple-400/10 border-purple-400/20', desc: 'Non-fungible token (NFT)' },
  'ERC-3643': { label: 'ERC-3643', colour: 'text-sal-primary bg-sal-primary/10 border-sal-primary/20', desc: 'Real-world asset (RWA) / security token' },
  'ERC-1400': { label: 'ERC-1400', colour: 'text-blue-400 bg-blue-400/10 border-blue-400/20', desc: 'Partitioned security / invoice token' },
  'CIP-108':  { label: 'CIP-108',  colour: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', desc: 'Governance proposal token' },
  'Custom':   { label: 'Custom',   colour: 'text-gray-400 bg-gray-400/10 border-gray-400/20', desc: 'Custom token' },
};

function tickerToStandard(ticker: string): string {
  if (ticker.startsWith('NFT'))              return 'ERC-721';
  if (ticker.startsWith('PROP') || ticker.startsWith('RWA')) return 'ERC-3643';
  if (ticker.startsWith('INV'))              return 'ERC-1400';
  if (ticker.startsWith('GOV'))              return 'CIP-108';
  return 'Custom';
}

// ── Token card ───────────────────────────────────────────────

function TokenCard({ ticker, live }: { ticker: string; live: boolean }) {
  const [info, setInfo]     = useState<TokenInfo | null>(null);
  const [failed, setFailed] = useState(false);
  // getToken normalises the sal prefix internally
  const clean    = ticker.replace(/^sal/, '');
  const standard = tickerToStandard(clean);
  const meta     = STANDARDS[standard] ?? STANDARDS['Custom'];

  useEffect(() => {
    getToken(clean)
      .then(setInfo)
      .catch((err: unknown) => {
        console.error(`[TokenCard] failed to load "${clean}":`, err);
        setFailed(true);
      });
  }, [clean]);

  return (
    <Link
      to={`/token/${clean}`}
      className="sal-card border border-sal-border rounded p-5 flex flex-col gap-3
                 hover:border-sal-border-hover hover:shadow-glow transition-all duration-300 group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded bg-sal-surface border border-sal-border flex items-center justify-center
                        text-sal-primary font-bold font-mono text-sm">
          {clean.slice(0, 2)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono px-2 py-1 rounded border ${meta.colour}`}
            title={meta.desc}
          >
            {meta.label}
          </span>
          {!live && (
            <span className="text-xs text-yellow-500/70 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">
              sample
            </span>
          )}
        </div>
      </div>

      {/* Name + ticker */}
      <div>
        <h3 className="font-heading font-semibold text-sal-text group-hover:text-sal-primary transition-colors leading-snug">
          {info?.name ?? clean}
        </h3>
        <p className="text-xs text-sal-muted font-mono mt-0.5">{clean}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-sal-border flex items-center justify-between text-xs text-sal-text2">
        {failed ? (
          <span className="text-red-400/70">Failed to load</span>
        ) : info ? (
          <>
            <span>Supply: <span className="text-sal-text font-mono">{info.supply.toLocaleString()}</span></span>
            <span className="flex items-center gap-1 text-sal-muted">
              View details
              <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
            </span>
          </>
        ) : (
          <span className="text-sal-muted">Loading...</span>
        )}
      </div>
    </Link>
  );
}

// ── How it works ─────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Browse',
    body: 'Explore tokens on the Salvium testnet. Each card shows live on-chain data — name, supply, and token type. In demo mode, sample tokens are shown so you can explore without any setup.',
  },
  {
    n: '02',
    title: 'Create',
    body: 'Choose a token type — real estate, NFT, invoice, or governance proposal — fill in the details, and click Mint. Creating tokens requires a local Salvium node running on your machine.',
  },
  {
    n: '03',
    title: 'Verify',
    body: 'After minting, the token detail page shows the on-chain record and transaction hash. Metadata is stored in a compact on-chain reference linked to a full JSON document hosted off-chain.',
  },
];

function HowItWorks() {
  return (
    <div className="mb-10">
      <p className="text-xs font-heading uppercase tracking-widest text-sal-muted mb-4">How it works</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-sal-border rounded overflow-hidden">
        {STEPS.map(s => (
          <div key={s.n} className="sal-card px-5 py-4">
            <div className="text-sal-primary font-heading font-bold text-xs tracking-widest mb-2">{s.n}</div>
            <p className="font-heading font-semibold text-sal-text text-sm mb-1">{s.title}</p>
            <p className="text-sal-text2 text-xs leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-sal-muted">
        New to Salvium tokens?{' '}
        <a
          href="https://docs.salvium.io/TOKENS/getting-started/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sal-primary hover:text-sal-light transition-colors"
        >
          Read the getting started guide →
        </a>
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

interface Props {
  live: boolean | null;
  setLive: (v: boolean) => void;
}

export default function MarketplacePage({ live, setLive }: Props) {
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');

  useEffect(() => {
    listTokens()
      .then(({ tickers, live: l }) => { setTickers(tickers); setLive(l); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const isLive = live === true;

  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="mb-10 pb-8 border-b border-sal-border">
        <p className="text-xs font-heading uppercase tracking-widest text-yellow-400 mb-3">
          Testnet Preview · Untested
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sal-text mb-3 leading-tight">
          Real-World Asset &amp;<br className="hidden sm:block" /> NFT Token Demo
        </h1>
        <p className="text-sal-text2 text-base max-w-2xl leading-relaxed">
          Mint real-world assets — property, invoices, NFT art, governance votes — as
          tokens on the Salvium chain. Each token carries structured metadata that any
          application can read and verify, while Salvium keeps the underlying transactions
          private by default.
        </p>
        <a
          href="https://docs.salvium.io/TOKENS/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-sal-primary hover:text-sal-light transition-colors"
        >
          How does the token system work? Read the docs →
        </a>

        {/* Preview disclaimer */}
        <div className="mt-5 flex items-start gap-2.5 text-xs text-yellow-200/70 bg-yellow-500/5 border border-yellow-500/20 rounded px-4 py-3 max-w-2xl">
          <span className="text-yellow-400 shrink-0 mt-px">⚠</span>
          <p>
            <span className="text-yellow-300 font-semibold">Testnet preview — not tested.</span>{' '}
            This demo runs against the Salvium RC2 testnet. It is provided for exploration and
            developer feedback only. Do not use with real assets or treat any output as production-ready.
          </p>
        </div>

        {!loading && !isLive && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            Demo mode · browsing sample tokens — no local node needed
          </div>
        )}
      </div>

      {/* ── Demo banner ───────────────────────────────────── */}
      {!loading && !isLive && <DemoBanner />}

      {/* ── How it works ──────────────────────────────────── */}
      <HowItWorks />

      {/* ── Section header ────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-heading font-semibold text-sal-text text-lg">
            {isLive ? 'Tokens on Chain' : 'Sample Tokens'}
          </h2>
          <p className="text-xs text-sal-muted mt-0.5">
            {isLive
              ? 'Live data from your Salvium node — click any card to view on-chain details'
              : <>Sample tokens showing the four main types.{' '}
                  <a
                    href="https://docs.salvium.io/TOKENS/getting-started/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sal-primary hover:text-sal-light transition-colors"
                  >
                    Connect a local node to mint real tokens →
                  </a>
                </>}
          </p>
        </div>
        {isLive ? (
          <Link
            to="/create"
            className="btn-primary px-4 py-2 text-black font-semibold rounded text-xs uppercase tracking-wider shrink-0"
          >
            + Mint Token
          </Link>
        ) : (
          <Link
            to="/create"
            className="px-4 py-2 border border-sal-border text-sal-muted rounded text-xs uppercase tracking-wider shrink-0 hover:border-sal-border-hover hover:text-sal-text2 transition-colors"
            title="Minting requires a local Salvium node"
          >
            + Mint Token
          </Link>
        )}
      </div>

      {/* ── States ────────────────────────────────────────── */}
      {loading && (
        <div className="py-20 flex items-center justify-center gap-3 text-sal-muted text-sm">
          <span className="spinner" />
          Connecting to middleware...
        </div>
      )}

      {error && (
        <div className="py-20 text-center">
          <p className="text-red-400 mb-1">Failed to load tokens</p>
          <p className="text-sal-muted text-xs">{error}</p>
        </div>
      )}

      {!loading && !error && tickers.length === 0 && isLive && (
        <div className="py-20 text-center">
          <p className="text-sal-text2 mb-2 font-heading font-semibold">No tokens in this wallet yet.</p>
          <p className="text-sal-muted text-xs mb-5">
            Make sure the wallet-rpc is synced and has minted at least one token.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 text-sal-primary border border-sal-border hover:border-sal-border-hover px-4 py-2 rounded text-sm transition-colors"
          >
            Mint the first token →
          </Link>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────── */}
      {!loading && !error && tickers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickers.map(t => <TokenCard key={t} ticker={t} live={isLive} />)}
        </div>
      )}

      {/* ── Bottom CTA ────────────────────────────────────── */}
      {!loading && !error && tickers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-sal-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sal-muted text-xs text-center sm:text-left">
            {isLive
              ? `${tickers.length} token${tickers.length !== 1 ? 's' : ''} in wallet`
              : <>
                  Showing sample data.{' '}
                  <a
                    href="https://docs.salvium.io/TOKENS/getting-started/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sal-primary hover:text-sal-light transition-colors"
                  >
                    Set up a local node to mint real tokens →
                  </a>
                </>}
          </p>
          {isLive && (
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-sal-border hover:border-sal-border-hover text-sal-text2 hover:text-sal-text rounded text-sm transition-colors"
            >
              + Create New Token
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
