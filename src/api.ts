const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001';

// Aligned with asset-sdk/src/types.ts — name and url are optional on-chain
export interface TokenInfo {
  asset_type: string;
  name?: string;
  supply: number;
  url?: string;
  token_type: number;
  version: number;
}

export interface CreateResult {
  tx_hash: string;
  fee: number;
  hex_payload: string;
  hash: string;
  size: number;
}

// --- Mock data shown when no middleware is reachable ---

export const MOCK_TOKENS: Record<string, TokenInfo> = {
  PROP: {
    asset_type: 'PROP',
    name: '123 High Street Property Token',
    supply: 1,
    url: 'https://demo.salvium.io/metadata/PROP.json',
    token_type: 2,
    version: 1,
  },
  NFT1: {
    asset_type: 'NFT1',
    name: 'Salvium Genesis NFT',
    supply: 1,
    url: 'https://demo.salvium.io/metadata/NFT1.json',
    token_type: 2,
    version: 1,
  },
  INV1: {
    asset_type: 'INV1',
    name: 'Invoice #2026-0042 — Acme Ltd',
    supply: 1,
    url: 'https://demo.salvium.io/metadata/INV1.json',
    token_type: 2,
    version: 1,
  },
  GOV1: {
    asset_type: 'GOV1',
    name: 'Treasury Allocation Proposal',
    supply: 1000,
    url: 'https://demo.salvium.io/metadata/GOV1.json',
    token_type: 2,
    version: 1,
  },
};

// --- Connection check ---

// Cached for up to 10 seconds — allows the UI to recover if the middleware
// starts after the page loads, without hammering the server on every call.
let _connected: boolean | null = null;
let _checkedAt = 0;
const CACHE_TTL = 10_000;

export function resetConnection(): void {
  _connected = null;
  _checkedAt = 0;
}

export async function checkConnection(): Promise<boolean> {
  if (_connected !== null && Date.now() - _checkedAt < CACHE_TTL) return _connected;
  try {
    const res = await fetch(`${BASE}/api/assets`, { signal: AbortSignal.timeout(2000) });
    _connected = res.ok;
  } catch {
    _connected = false;
  }
  _checkedAt = Date.now();
  return _connected;
}

// --- Shared error extraction ---

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json() as { error?: string };
    return body.error ?? `${fallback} (HTTP ${res.status})`;
  } catch {
    return `${fallback} (HTTP ${res.status})`;
  }
}

// --- API calls with mock fallback ---

export async function listTokens(): Promise<{ tickers: string[]; live: boolean }> {
  // Reuse the connection check response rather than making a separate call
  const res = await fetch(`${BASE}/api/assets`, { signal: AbortSignal.timeout(2000) })
    .catch(() => null);

  if (!res?.ok) {
    _connected = false;
    _checkedAt = Date.now();
    return { tickers: Object.keys(MOCK_TOKENS).map(t => `sal${t}`), live: false };
  }

  _connected = true;
  _checkedAt = Date.now();
  const data = await res.json() as { tokens?: string[] };
  return { tickers: data.tokens ?? [], live: true };
}

export async function getToken(ticker: string): Promise<TokenInfo> {
  // Normalize — strip sal prefix so callers don't need to manage it
  const clean = ticker.replace(/^sal/, '');

  const live = await checkConnection();
  if (!live) {
    const mock = MOCK_TOKENS[clean];
    if (!mock) throw new Error(`Token ${clean} not found`);
    return mock;
  }

  const res = await fetch(`${BASE}/api/assets/${clean}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to get token'));
  return res.json() as Promise<TokenInfo>;
}

export async function createToken(params: {
  ticker: string;
  supply: number;
  name: string;
  metadata: object;
}): Promise<CreateResult> {
  const res = await fetch(`${BASE}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to create token'));
  return res.json() as Promise<CreateResult>;
}
