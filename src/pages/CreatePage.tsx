import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createToken, checkConnection } from '../api';

// ── Templates ────────────────────────────────────────────────

const TEMPLATES = {
  property: {
    label:    'Property Token',
    standard: 'ERC-3643',
    badge:    'RWA',
    badgeColour: 'text-sal-primary bg-sal-primary/10 border-sal-primary/20',
    desc:     'Tokenise real estate, equity, or physical assets with ERC-3643 compliance metadata',
    ticker:   'PROP',
    name:     'Property Token',
    description: 'Fractional ownership token for UK residential property',
    id:       'GB-PROP-2026-0001',
    supply:   1,
    supplyHelp: 'Set to 1 for a unique asset token. Use a higher number for fractional shares.',
    extra: {
      rwa: {
        asset_type:  'real_estate',
        jurisdiction: 'GB',
        valuation: { amount: 250000, currency: 'GBP', date: new Date().toISOString().slice(0, 10) },
      },
    },
  },
  nft: {
    label:    'NFT',
    standard: 'ERC-721',
    badge:    'NFT',
    badgeColour: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    desc:     'Create a unique digital collectible with image, attributes, and provenance metadata',
    ticker:   'NFT1',
    name:     'My NFT',
    description: 'A unique digital collectible on the Salvium chain',
    id:       'NFT-0001',
    supply:   1,
    supplyHelp: 'Supply of 1 = unique, non-fungible token. ERC-1155 editions can use higher values.',
    extra: {
      nft: { image: 'https://demo.salvium.io/nft/placeholder.png', attributes: [] },
    },
  },
  invoice: {
    label:    'Invoice Token',
    standard: 'ERC-1400',
    badge:    'Invoice',
    badgeColour: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    desc:     'Represent a trade receivable as a transferable token for invoice finance',
    ticker:   'INV1',
    name:     'Invoice Token',
    description: 'Token representing invoice INV-2026-0001 payable by Buyer Corp',
    id:       'INV-2026-0001',
    supply:   1,
    supplyHelp: 'Usually 1 for a single invoice. Supply > 1 can represent invoice fractions.',
    extra: {
      invoice: {
        invoice_number: 'INV-2026-0001',
        issuer: 'Acme Ltd',
        debtor: 'Buyer Corp',
        amount: 10000,
        currency: 'GBP',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'outstanding',
      },
    },
  },
  governance: {
    label:    'Governance Proposal',
    standard: 'CIP-108',
    badge:    'Gov',
    badgeColour: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    desc:     'Mint a DAO governance proposal token for on-chain voting with CIP-108 metadata',
    ticker:   'GOV1',
    name:     'Governance Proposal',
    description: 'DAO governance proposal for treasury allocation',
    id:       'CIP-2026-001',
    supply:   1000,
    supplyHelp: 'Governance tokens are often fungible — supply represents voting power distribution.',
    extra: {
      governance: {
        proposal_id:           'CIP-2026-001',
        proposer:              'Community DAO',
        proposal_text:         'Treasury allocation proposal for network development fund',
        voting_period_blocks:  10080,
        quorum_percentage:     10,
        options:               ['yes', 'no', 'abstain'],
      },
    },
  },
} as const;

type TemplateKey = keyof typeof TEMPLATES;

type SubmitStep = 'idle' | 'building' | 'done';

// ── Field component ──────────────────────────────────────────

function Field({
  label, required, help, children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-sal-muted mb-1 uppercase tracking-wider font-heading">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {help && <p className="text-xs text-sal-muted mt-1 leading-relaxed">{help}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function CreatePage({ live }: { live: boolean | null }) {
  const navigate = useNavigate();
  const [template, setTemplate]     = useState<TemplateKey>('property');
  const [ticker, setTicker]         = useState(TEMPLATES.property.ticker);
  const [name, setName]             = useState(TEMPLATES.property.name);
  const [description, setDescription] = useState(TEMPLATES.property.description);
  const [id, setId]                 = useState(TEMPLATES.property.id);
  const [supply, setSupply]         = useState(TEMPLATES.property.supply);
  const [step, setStep]             = useState<SubmitStep>('idle');
  const [error, setError]           = useState('');

  // If live is null (still checking) use checkConnection as fallback
  const [resolvedLive, setResolvedLive] = useState<boolean | null>(live);
  useEffect(() => {
    if (live !== null) { setResolvedLive(live); return; }
    checkConnection().then(setResolvedLive);
  }, [live]);

  function applyTemplate(key: TemplateKey) {
    const t = TEMPLATES[key];
    setTemplate(key);
    setTicker(t.ticker);
    setName(t.name);
    setDescription(t.description);
    setId(t.id);
    setSupply(t.supply);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ticker.length !== 4) { setError('Ticker must be exactly 4 characters'); return; }
    setError('');
    setStep('building');

    const t = TEMPLATES[template];
    const metadata = {
      name,
      description,
      id,
      technical: { standard: t.standard, encoding: { charset: 'UTF-8' } },
      created_at: new Date().toISOString(),
      schema_version: '2.0.0',
      ...t.extra,
    };

    try {
      const result = await createToken({ ticker, supply, name, metadata });
      // Store tx data for the token detail page
      sessionStorage.setItem('salvium_last_tx', JSON.stringify({
        tx_hash: result.tx_hash,
        fee: result.fee,
        ticker,
      }));
      setStep('done');
      setTimeout(() => navigate(`/token/${ticker}?created=1`), 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('idle');
    }
  }

  const submitting  = step === 'building' || step === 'done';
  const canSubmit   = resolvedLive === true && !submitting;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-sal-muted mb-6">
        <Link to="/" className="hover:text-sal-text transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-sal-text">Create Token</span>
      </div>

      {/* ── Heading ─────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-sal-text mb-1">Create Token</h1>
        <p className="text-sal-text2 text-sm">
          Mint a new token on the Salvium testnet. The token and its metadata are written
          directly to the chain via wallet-rpc.
        </p>
      </div>

      {/* ── Not connected warning ────────────────────────── */}
      {resolvedLive === false && (
        <div className="mb-6 border border-yellow-500/30 bg-yellow-500/5 rounded overflow-hidden">
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
            <span className="text-yellow-400 text-sm">⚠</span>
            <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider font-heading">
              Middleware not connected
            </span>
          </div>
          <div className="px-5 py-4 text-xs text-yellow-200/70 leading-relaxed space-y-2">
            <p>Token creation requires the Salvium daemon, wallet-rpc, and middleware all running locally.</p>
            <p>Start all three components, then refresh this page. The form will unlock automatically.</p>
            <pre className="mt-3 bg-black/40 text-yellow-100 px-3 py-2 rounded font-mono overflow-x-auto leading-relaxed">
{`# 1. Daemon
salviumd --testnet --offline --fixed-difficulty 500

# 2. Wallet RPC
salvium-wallet-rpc --wallet-file ./demo --password demo \\
  --testnet --daemon-address 127.0.0.1:29081 \\
  --rpc-bind-port 29088 --disable-rpc-login

# 3. Middleware
cd salvium/middleware
RPC_URL=http://127.0.0.1:29088/json_rpc \\
RPC_USER=1 RPC_PASS=1 PORT=3001 \\
npx tsx src/server.ts`}
            </pre>
          </div>
        </div>
      )}

      {/* ── Template selector ───────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs text-sal-muted uppercase tracking-wider font-heading mb-3">Choose a template</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(TEMPLATES) as TemplateKey[]).map(key => {
            const t = TEMPLATES[key];
            const active = template === key;
            return (
              <button
                key={key}
                onClick={() => applyTemplate(key)}
                className={`p-3 rounded border text-left transition-all ${
                  active
                    ? 'border-sal-primary bg-sal-primary/10'
                    : 'border-sal-border hover:border-sal-border-hover bg-sal-surface'
                }`}
              >
                <span className={`inline-block text-xs font-mono px-1.5 py-0.5 rounded border mb-2 ${t.badgeColour}`}>
                  {t.badge}
                </span>
                <p className={`text-xs font-heading font-semibold leading-snug ${active ? 'text-sal-primary' : 'text-sal-text'}`}>
                  {t.label}
                </p>
                <p className="text-xs text-sal-muted mt-1 leading-relaxed hidden sm:block">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="sal-card border border-sal-border rounded p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Ticker"
            required
            help="Exactly 4 characters — this is the permanent on-chain identifier."
          >
            <input
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              className="w-full bg-sal-surface border border-sal-border rounded px-3 py-2 text-sal-text font-mono text-sm focus:outline-none focus:border-sal-primary transition-colors"
              placeholder="PROP"
              required
            />
          </Field>

          <Field
            label="Supply"
            required
            help={TEMPLATES[template].supplyHelp}
          >
            <input
              type="number"
              value={supply}
              onChange={e => setSupply(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full bg-sal-surface border border-sal-border rounded px-3 py-2 text-sal-text text-sm focus:outline-none focus:border-sal-primary transition-colors"
              required
            />
          </Field>
        </div>

        <Field label="Name" required>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-sal-surface border border-sal-border rounded px-3 py-2 text-sal-text text-sm focus:outline-none focus:border-sal-primary transition-colors"
            placeholder="My Token Name"
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-sal-surface border border-sal-border rounded px-3 py-2 text-sal-text text-sm focus:outline-none focus:border-sal-primary transition-colors resize-none"
          />
        </Field>

        <Field
          label="Asset ID"
          help="A stable external reference: ISIN, legal reference, invoice number, proposal ID, etc. Stored in the Tier 2 metadata blob."
        >
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            className="w-full bg-sal-surface border border-sal-border rounded px-3 py-2 text-sal-text font-mono text-sm focus:outline-none focus:border-sal-primary transition-colors"
            placeholder="GB-PROP-2026-0001"
          />
        </Field>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* Submit row */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex-1 py-3 rounded font-heading font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              canSubmit
                ? 'btn-primary text-black'
                : 'bg-sal-surface text-sal-muted border border-sal-border cursor-not-allowed'
            }`}
          >
            {step === 'building' && <span className="spinner" />}
            {step === 'done'     && <span>✓</span>}
            {step === 'idle'     && !canSubmit && resolvedLive === false && 'Middleware not connected'}
            {step === 'idle'     && !canSubmit && resolvedLive === null  && 'Checking connection…'}
            {step === 'idle'     && canSubmit                            && 'Mint Token'}
            {step === 'building'                                          && 'Building transaction…'}
            {step === 'done'                                              && 'Done — redirecting'}
          </button>

          <Link
            to="/"
            className="px-5 py-3 border border-sal-border text-sal-text2 hover:text-sal-text rounded text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Step indicator */}
        {step === 'building' && (
          <div className="text-center text-xs text-sal-muted space-y-1">
            <p className="step-active">Submitting transaction to wallet-rpc…</p>
            <p className="text-sal-muted/50">This takes a few seconds while the transaction is built and broadcast.</p>
          </div>
        )}
      </form>

      {/* ── What happens next ───────────────────────────── */}
      <div className="mt-6 px-4 py-4 border border-sal-border rounded text-xs text-sal-muted leading-relaxed">
        <p className="font-heading text-sal-text2 font-semibold mb-2 uppercase tracking-wider text-xs">What happens when you mint</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>The middleware encodes your metadata to hex and sends a <code className="text-sal-primary bg-sal-surface px-1 rounded">create_token</code> call to wallet-rpc.</li>
          <li>wallet-rpc builds a transaction and broadcasts it to the Salvium testnet daemon.</li>
          <li>The token appears in the wallet once the transaction is confirmed on chain.</li>
          <li>The transaction hash is returned immediately and shown on the detail page.</li>
        </ol>
      </div>
    </div>
  );
}
