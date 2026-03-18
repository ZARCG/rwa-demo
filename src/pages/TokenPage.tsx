import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getToken, type TokenInfo } from '../api';

// ── Field row ─────────────────────────────────────────────────

function Field({
  label,
  value,
  mono = false,
  link = false,
  hint,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  link?: boolean;
  hint?: string;
}) {
  const text = String(value);
  return (
    <div className="py-3 border-b border-sal-border last:border-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs text-sal-muted uppercase tracking-wider font-heading">{label}</span>
        {hint && (
          <span
            className="text-sal-muted/50 text-xs cursor-default border border-sal-border rounded-full w-4 h-4 inline-flex items-center justify-center leading-none"
            title={hint}
          >
            ?
          </span>
        )}
      </div>
      {link && text ? (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm text-sal-primary hover:text-sal-light transition-colors break-all ${mono ? 'font-mono' : ''}`}
        >
          {text} ↗
        </a>
      ) : (
        <div className={`text-sm text-sal-text break-all ${mono ? 'font-mono' : ''}`}>{text}</div>
      )}
    </div>
  );
}

// ── Token type labels ─────────────────────────────────────────

function tokenTypeLabel(t: number) {
  if (t === 2) return 'SAL Token (type 2)';
  return String(t);
}

// ── Page ─────────────────────────────────────────────────────

export default function TokenPage({ live }: { live: boolean | null }) {
  const { ticker }         = useParams<{ ticker: string }>();
  const [searchParams]     = useSearchParams();
  const justCreated        = searchParams.get('created') === '1';

  const [info, setInfo]    = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]  = useState('');
  const [retries, setRetries] = useState(0);

  // Retrieve tx data stored by CreatePage
  const storedTx = (() => {
    try {
      const raw = sessionStorage.getItem('salvium_last_tx');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.ticker === ticker ? parsed : null;
    } catch { return null; }
  })();

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    getToken(ticker)
      .then(data => { setInfo(data); setLoading(false); })
      .catch(e => {
        if (retries < 5) {
          setTimeout(() => setRetries(r => r + 1), 3000);
        } else {
          setError(e.message);
          setLoading(false);
        }
      });
  }, [ticker, retries]);

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-sal-muted mb-6">
          <Link to="/" className="hover:text-sal-text transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-sal-text">{ticker}</span>
        </div>
        <div className="py-20 flex flex-col items-center gap-4 text-sal-muted">
          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
          {justCreated ? (
            <div className="text-center">
              <p className="text-sal-text2 font-heading font-semibold mb-1">Waiting for confirmation</p>
              <p className="text-xs">
                Transaction submitted — checking chain
                {retries > 0 ? ` (attempt ${retries + 1}/6)` : ''}…
              </p>
            </div>
          ) : (
            <p className="text-sm">Loading token data…</p>
          )}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-sal-muted mb-6">
          <Link to="/" className="hover:text-sal-text transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-sal-text">{ticker}</span>
        </div>
        <div className="py-16 text-center">
          <p className="text-red-400 mb-2 font-heading font-semibold">Token not found</p>
          <p className="text-sal-muted text-xs mb-6 max-w-sm mx-auto">{error}</p>
          <Link to="/" className="text-sal-primary hover:text-sal-light text-sm transition-colors">
            ← Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!info) return null;

  const isLive = live === true;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-sal-muted mb-6">
        <Link to="/" className="hover:text-sal-text transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-sal-text font-mono">{info.asset_type}</span>
      </div>

      {/* ── Success banner ──────────────────────────────── */}
      {justCreated && (
        <div className="mb-6 px-4 py-3 bg-sal-primary/10 border border-sal-primary/30 rounded flex items-start gap-3">
          <span className="text-sal-primary text-base mt-0.5">✓</span>
          <div>
            <p className="text-sal-primary font-heading font-semibold text-sm">Token minted successfully</p>
            <p className="text-sal-text2 text-xs mt-0.5">
              Your token has been submitted to the Salvium testnet and the on-chain data is shown below.
            </p>
          </div>
        </div>
      )}

      {/* ── Token header ────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-7">
        <div className="w-14 h-14 rounded bg-sal-surface border border-sal-border flex items-center justify-center text-sal-primary font-bold font-mono text-xl shrink-0">
          {info.asset_type.slice(0, 2)}
        </div>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-sal-text leading-snug">
            {info.name}
          </h1>
          <p className="text-sal-muted font-mono text-sm mt-0.5">{info.asset_type}</p>
        </div>
      </div>

      {/* ── On-chain data ────────────────────────────────── */}
      <div className="sal-card border border-sal-border rounded p-5 mb-4">
        <p className="text-xs text-sal-muted uppercase tracking-wider font-heading mb-3">On-Chain Data</p>
        <Field label="Asset Type" value={info.asset_type} mono />
        <Field label="Name" value={info.name} />
        <Field
          label="Supply"
          value={info.supply.toLocaleString()}
          mono
          hint="Total number of tokens created. For unique assets this is 1; for fungible tokens it can be any positive integer."
        />
        <Field
          label="Token Type"
          value={tokenTypeLabel(info.token_type)}
          mono
          hint="Salvium token type identifier. Type 2 = user-created SAL token (as opposed to native SAL1)."
        />
        <Field
          label="Protocol Version"
          value={`v${info.version}`}
          mono
          hint="Version of the Salvium token protocol used. v1 = current mainnet version."
        />
        {info.url && (
          <Field
            label="Metadata URL"
            value={info.url}
            mono
            link
            hint="URI to the hosted Tier 2 metadata blob. Click to view the raw JSON."
          />
        )}
      </div>

      {/* ── Transaction data ─────────────────────────────── */}
      <div className="sal-card border border-sal-border rounded p-5 mb-4">
        <p className="text-xs text-sal-muted uppercase tracking-wider font-heading mb-3">Transaction</p>

        {storedTx?.tx_hash ? (
          <>
            <Field
              label="Transaction Hash"
              value={storedTx.tx_hash}
              mono
              hint="The Salvium testnet transaction ID for this token creation."
            />
            {storedTx.fee && (
              <Field
                label="Fee Paid"
                value={`${(storedTx.fee / 1e12).toFixed(8)} SAL`}
                mono
                hint="Transaction fee in SAL (atomic units divided by 1e12)."
              />
            )}
          </>
        ) : (
          <div className="py-2 text-sm text-sal-text2">
            {justCreated ? (
              <p>Transaction hash was not returned in this session. It is stored in the wallet transaction history.</p>
            ) : (
              <p>Transaction hash is only available immediately after creation in this session.</p>
            )}
          </div>
        )}

        <div className="pt-3 mt-1 border-t border-sal-border text-xs text-sal-muted">
          Block explorer for this testnet version (RC2) is not yet deployed.
          Transaction history is available via <code className="text-sal-primary bg-sal-surface px-1 rounded">get_transfers</code> in wallet-rpc.
        </div>
      </div>

      {/* ── Network ──────────────────────────────────────── */}
      <div className="sal-card border border-sal-border rounded p-5 mb-7">
        <p className="text-xs text-sal-muted uppercase tracking-wider font-heading mb-3">Network</p>
        <Field label="Network" value="Salvium Testnet" />
        <Field
          label="Status"
          value={isLive ? 'Confirmed on chain' : 'Sample data (not on chain)'}
          hint={isLive
            ? 'This token exists in a wallet connected to the Salvium testnet.'
            : 'This is demo data — connect the middleware to see real on-chain tokens.'}
        />
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-4 py-2.5 border border-sal-border text-sal-text2 hover:text-sal-text rounded text-sm transition-colors"
        >
          ← Marketplace
        </Link>
        <Link
          to="/create"
          className="px-4 py-2.5 border border-sal-border hover:border-sal-border-hover text-sal-text2 hover:text-sal-text rounded text-sm transition-colors"
        >
          + Create Another
        </Link>
      </div>
    </div>
  );
}
