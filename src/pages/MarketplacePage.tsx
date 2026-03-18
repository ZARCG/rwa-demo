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
  const [info, setInfo] = useState<TokenInfo | null>(null);
  const clean    = ticker.replace(/^sal/, '');
  const standard = tickerToStandard(clean);
  const meta     = STANDARDS[standard] ?? STANDARDS['Custom'];

  useEffect(() => {
    getToken(clean).then(setInfo).catch(() => null);
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
        {info ? (
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
    body: 'Explore tokens minted on the Salvium testnet. Each card shows on-chain data — ticker, name, supply — pulled live from wallet-rpc.',
  },
  {
    n: '02',
    title: 'Create',
    body: 'Pick a token template (RWA, NFT, Invoice, Governance), fill in the details, and mint directly to the chain. Requires the local middleware.',
  },
  {
    n: '03',
    title: 'Verify',
    body: 'After minting, the token detail page confirms on-chain data and shows the transaction hash. The three-tier metadata is stored alongside.',
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
        <p className="text-xs font-heading uppercase tracking-widest text-sal-primary mb-3">
          Salvium Testnet · RC2
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sal-text mb-3 leading-tight">
          Real-World Asset &amp;<br className="hidden sm:block" /> NFT Token Demo
        </h1>
        <p className="text-sal-text2 text-base max-w-2xl leading-relaxed">
          Salvium's three-tier token protocol lets you mint RWAs, NFTs, and governance tokens
          with structured, verifiable metadata — while preserving the privacy guarantees
          of the Salvium chain. This demo shows the full lifecycle against a live testnet.
        </p>
        {!loading && !isLive && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            Showing sample data — no middleware detected
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
              ? 'Live data from wallet-rpc — click any card to see on-chain details'
              : 'Sample tokens showing the four main token types — connect the middleware to see real data'}
          </p>
        </div>
        {isLive && (
          <Link
            to="/create"
            className="btn-primary px-4 py-2 text-black font-semibold rounded text-xs uppercase tracking-wider shrink-0"
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
              : 'Connect the middleware to see real tokens and enable minting'}
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
