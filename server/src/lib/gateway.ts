import { ARC_TESTNET_USDC_ADDRESS, env } from '../config.js';
import { getDirectUsdcBalance, getWalletAddress } from './circle.js';
import type { UnifiedBalanceResponse } from '../types.js';

function extractGatewayBalance(payload: any): string | null {
  const candidates = [
    payload?.balance,
    payload?.data?.balance,
    payload?.balances?.[0]?.balance,
    payload?.data?.balances?.[0]?.balance,
    payload?.result?.[0]?.balance,
    payload?.data?.result?.[0]?.balance
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      return String(candidate);
    }
  }
  return null;
}

async function postBalancesRequest(address: string): Promise<string | null> {
  const endpoint = `${env.GATEWAY_API_BASE.replace(/\/$/, '')}/v1/balances`;
  const requestBodies = [
    { address, chain: 'arc', token: ARC_TESTNET_USDC_ADDRESS },
    [{ address, chain: 'arc', token: ARC_TESTNET_USDC_ADDRESS }],
    { queries: [{ address, chain: 'arc', token: ARC_TESTNET_USDC_ADDRESS }] },
    { addresses: [address], chain: 'arc', token: ARC_TESTNET_USDC_ADDRESS }
  ];

  for (const body of requestBodies) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) continue;
      const json = await response.json();
      const balance = extractGatewayBalance(json);
      if (balance !== null) return balance;
    } catch {
      // ignore and continue trying alternate request shapes
    }
  }

  return null;
}

export async function getUnifiedBalance(walletId: string): Promise<UnifiedBalanceResponse> {
  const [address, directBalance] = await Promise.all([
    getWalletAddress(walletId),
    getDirectUsdcBalance(walletId)
  ]);

  if (!env.ENABLE_GATEWAY_EXPERIMENTAL) {
    return {
      walletId,
      address,
      currency: 'USDC',
      balance: directBalance,
      directBalance,
      gatewayEnabled: false,
      source: 'wallet',
      note: 'Gateway lookup disabled; returning direct Arc balance.'
    };
  }

  const gatewayBalance = await postBalancesRequest(address);
  if (gatewayBalance !== null) {
    return {
      walletId,
      address,
      currency: 'USDC',
      balance: gatewayBalance,
      directBalance,
      gatewayEnabled: true,
      source: 'gateway'
    };
  }

  return {
    walletId,
    address,
    currency: 'USDC',
    balance: directBalance,
    directBalance,
    gatewayEnabled: false,
    source: 'wallet',
    note: 'Gateway unavailable or request shape needs confirmation against current Circle docs.'
  };
}

export async function depositToGateway(_walletId: string, _amount: string) {
  if (!env.ENABLE_GATEWAY_DEPOSIT) {
    return {
      enabled: false,
      status: 'NOT_ENABLED',
      message: 'Gateway deposit is disabled by default. Confirm current Circle Gateway deposit contract interface before enabling it.'
    };
  }

  throw new Error('Gateway deposit flow requires confirmation against current Circle Gateway contract interfaces before use.');
}
