const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001';

export interface TokenInfo {
  asset_type: string;
  name: string;
  supply: number;
  url: string;
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

let _connected: boolean | null = null;

export async function checkConnection(): Promise<boolean> {
  if (_connected !== null) return _connected;
  try {
    const res = await fetch(`${BASE}/api/assets`, { signal: AbortSignal.timeout(2000) });
    _connected = res.ok;
  } catch {
    _connected = false;
  }
  return _connected;
}

// --- API calls with mock fallback ---

export async function listTokens(): Promise<{ tickers: string[]; live: boolean }> {
  const live = await checkConnection();
  if (!live) return { tickers: Object.keys(MOCK_TOKENS).map(t => `sal${t}`), live: false };
  const res = await fetch(`${BASE}/api/assets`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to list tokens');
  return { tickers: data.tokens ?? [], live: true };
}

export async function getToken(ticker: string): Promise<TokenInfo> {
  const live = await checkConnection();
  if (!live) {
    const mock = MOCK_TOKENS[ticker];
    if (!mock) throw new Error(`Token ${ticker} not found`);
    return mock;
  }
  const res = await fetch(`${BASE}/api/assets/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to get token');
  return data;
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
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to create token');
  return data;
}
