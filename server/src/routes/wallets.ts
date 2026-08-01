import { Router } from 'express';
import { getWalletBalance, listWallets } from '../lib/circle.js';
import { getUnifiedBalance } from '../lib/gateway.js';

export const walletsRouter = Router();

walletsRouter.get('/wallets', async (_req, res, next) => {
  try {
    const wallets = await listWallets();
    res.json({ wallets });
  } catch (error) {
    next(error);
  }
});

walletsRouter.get('/wallets/:walletId/balance', async (req, res, next) => {
  try {
    const payload = await getWalletBalance(req.params.walletId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

walletsRouter.get('/wallets/:walletId/unified-balance', async (req, res, next) => {
  try {
    const payload = await getUnifiedBalance(req.params.walletId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
