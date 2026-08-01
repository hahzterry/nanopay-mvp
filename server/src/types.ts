export type ApiWallet = {
  id: string;
  address: string;
  label: string;
  balances: Array<{ token: string; amount: string }>;
  directBalance: string;
};

export type UnifiedBalanceResponse = {
  walletId: string;
  address: string;
  currency: 'USDC';
  balance: string;
  directBalance: string;
  gatewayEnabled: boolean;
  source: 'gateway' | 'wallet';
  note?: string;
};
