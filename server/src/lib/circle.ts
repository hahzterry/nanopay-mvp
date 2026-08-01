import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { ARC_TESTNET, ARC_TESTNET_USDC_TOKEN_ID, env } from '../config.js';
import { extractTokenBalances, extractWallets, findUsdcBalance, pickTransaction, randomId } from './helpers.js';
import type { ApiWallet } from '../types.js';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: env.CIRCLE_API_KEY,
  entitySecret: env.CIRCLE_ENTITY_SECRET
});

export async function listWallets(): Promise<ApiWallet[]> {
  const response = await client.getWalletsWithBalances({
    blockchain: ARC_TESTNET,
    walletSetId: env.WALLET_SET_ID
  } as any);

  const wallets = extractWallets(response).slice(0, 2);

  const hydrated = await Promise.all(
    wallets.map(async (wallet, index) => {
      const balanceResponse = await client.getWalletTokenBalance({ id: wallet.id, includeAll: true } as any);
      const balances = extractTokenBalances(balanceResponse).map((item) => ({
        token: item.token,
        amount: item.amount
      }));
      const usdc = findUsdcBalance(balanceResponse);

      return {
        id: wallet.id,
        address: wallet.address,
        label: index === 0 ? 'Wallet A' : 'Wallet B',
        balances,
        directBalance: usdc.amount
      } satisfies ApiWallet;
    })
  );

  return hydrated;
}

export async function getWalletAddress(walletId: string): Promise<string> {
  const response = await client.getWallet({ id: walletId } as any);
  const wallet = (response as any)?.data?.wallet ?? (response as any)?.wallet;
  const address = wallet?.address ?? wallet?.walletAddress;
  if (!address) {
    throw new Error('Wallet address not found');
  }
  return String(address);
}

export async function getWalletBalance(walletId: string) {
  const response = await client.getWalletTokenBalance({ id: walletId, includeAll: true } as any);
  return {
    walletId,
    balances: extractTokenBalances(response).map((item) => ({
      token: item.token,
      amount: item.amount
    }))
  };
}

export async function getDirectUsdcBalance(walletId: string) {
  const response = await client.getWalletTokenBalance({ id: walletId, includeAll: true } as any);
  return findUsdcBalance(response).amount;
}

export async function createTransfer(input: { fromWalletId: string; toAddress: string; amount: string }) {
  const response = await client.createTransaction({
    walletId: input.fromWalletId,
    destinationAddress: input.toAddress,
    amounts: [input.amount],
    tokenId: ARC_TESTNET_USDC_TOKEN_ID,
    idempotencyKey: randomId(),
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM'
      }
    }
  } as any);

  const transaction = pickTransaction(response);
  return {
    transactionId: String(transaction?.id ?? (response as any)?.data?.id ?? ''),
    status: 'PENDING' as const
  };
}

export async function getTransaction(transactionId: string) {
  const response = await client.getTransaction({ id: transactionId } as any);
  return pickTransaction(response);
}

export { client };
