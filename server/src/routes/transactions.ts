import { Router } from 'express';
import { createTransfer, getTransaction } from '../lib/circle.js';
import { formatErrorMessage, isValidEvmAddress, isValidPositiveAmount, normalizeTransactionStatus } from '../lib/helpers.js';

export const transactionsRouter = Router();

transactionsRouter.post('/transfer', async (req, res, next) => {
  try {
    const { fromWalletId, toAddress, amount } = req.body ?? {};

    if (!fromWalletId || typeof fromWalletId !== 'string') {
      return res.status(400).json({ error: 'fromWalletId is required.' });
    }

    if (!amount || typeof amount !== 'string' || !isValidPositiveAmount(amount)) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    if (!toAddress || typeof toAddress !== 'string' || !isValidEvmAddress(toAddress)) {
      return res.status(400).json({ error: 'Destination address must be a valid EVM address.' });
    }

    const result = await createTransfer({ fromWalletId, toAddress, amount });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

transactionsRouter.get('/transactions/:transactionId', async (req, res, next) => {
  try {
    const tx = await getTransaction(req.params.transactionId);
    res.json({
      transactionId: String(tx?.id ?? req.params.transactionId),
      status: normalizeTransactionStatus(tx?.state),
      amount: String(tx?.amounts?.[0] ?? '0'),
      destinationAddress: String(tx?.destinationAddress ?? ''),
      rawState: tx?.state ?? null,
      txHash: tx?.txHash ?? null,
      errorReason: tx?.errorReason ?? null
    });
  } catch (error) {
    const message = formatErrorMessage(error);
    next(new Error(message));
  }
});
