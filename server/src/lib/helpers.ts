export function isValidPositiveAmount(value: string): boolean {
  if (!value) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function isValidEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function normalizeTransactionStatus(state?: string): 'PENDING' | 'COMPLETE' | 'FAILED' {
  const value = String(state ?? '').toUpperCase();
  if (value === 'COMPLETE') return 'COMPLETE';
  if (['FAILED', 'CANCELLED', 'DENIED'].includes(value)) return 'FAILED';
  return 'PENDING';
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export function extractWallets(raw: any): Array<{ id: string; address: string; createDate?: string }> {
  const wallets = raw?.data?.wallets ?? raw?.wallets ?? [];
  return (Array.isArray(wallets) ? wallets : [])
    .map((wallet: any) => ({
      id: String(wallet?.id ?? ''),
      address: String(wallet?.address ?? wallet?.walletAddress ?? ''),
      createDate: wallet?.createDate
    }))
    .filter((wallet) => wallet.id && wallet.address)
    .sort((a, b) => String(a.createDate ?? '').localeCompare(String(b.createDate ?? '')));
}

export function extractTokenBalances(raw: any): Array<{ token: string; amount: string; tokenId?: string; tokenAddress?: string }> {
  const items = raw?.data?.tokenBalances ?? raw?.data?.balances ?? raw?.tokenBalances ?? raw?.balances ?? [];
  if (!Array.isArray(items)) return [];

  return items.map((item: any) => ({
    token: String(item?.token?.symbol ?? item?.symbol ?? item?.token?.name ?? item?.name ?? 'UNKNOWN'),
    amount: String(item?.amount ?? item?.balance ?? item?.availableBalance ?? '0'),
    tokenId: item?.token?.id ?? item?.tokenId,
    tokenAddress: item?.token?.tokenAddress ?? item?.tokenAddress ?? item?.token?.address
  }));
}

export function findUsdcBalance(raw: any): { token: string; amount: string; tokenId?: string; tokenAddress?: string } {
  const balances = extractTokenBalances(raw);
  return (
    balances.find((item) => item.token.toUpperCase() === 'USDC') ?? {
      token: 'USDC',
      amount: '0'
    }
  );
}

export function pickTransaction(raw: any): any {
  return raw?.data?.transaction ?? raw?.transaction ?? raw?.data ?? raw;
}

export function randomId(): string {
  return crypto.randomUUID();
}
