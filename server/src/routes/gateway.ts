import { Router } from 'express';
import { depositToGateway } from '../lib/gateway.js';
import { isValidPositiveAmount } from '../lib/helpers.js';

export const gatewayRouter = Router();

gatewayRouter.post('/gateway/deposit', async (req, res, next) => {
  try {
    const { walletId, amount } = req.body ?? {};
    if (!walletId || typeof walletId !== 'string') {
      return res.status(400).json({ error: 'walletId is required.' });
    }
    if (!amount || typeof amount !== 'string' || !isValidPositiveAmount(amount)) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const result = await depositToGateway(walletId, amount);
    const statusCode = result.enabled ? 200 : 501;
    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
});
