export type Wallet = {
  id: string;
  address: string;
  label: string;
  balances: Array<{ token: string; amount: string }>;
  directBalance: string;
};

export type WalletsResponse = {
  wallets: Wallet[];
};

export type UnifiedBalance = {
  walletId: string;
  address: string;
  currency: 'USDC';
  balance: string;
  directBalance: string;
  gatewayEnabled: boolean;
  source: 'gateway' | 'wallet';
  note?: string;
};

export type TransactionResponse = {
  transactionId: string;
  status: 'PENDING' | 'COMPLETE' | 'FAILED';
  amount: string;
  destinationAddress: string;
  rawState?: string | null;
  txHash?: string | null;
  errorReason?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.error ? payload.error : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  getWallets: () => request<WalletsResponse>('/api/wallets'),
  getUnifiedBalance: (walletId: string) => request<UnifiedBalance>(`/api/wallets/${walletId}/unified-balance`),
  createTransfer: (input: { fromWalletId: string; toAddress: string; amount: string }) =>
    request<{ transactionId: string; status: 'PENDING' }>(`/api/transfer`, {
      method: 'POST',
      body: JSON.stringify(input)
    }),
  getTransaction: (transactionId: string) => request<TransactionResponse>(`/api/transactions/${transactionId}`)
};
