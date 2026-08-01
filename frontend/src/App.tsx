import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, type TransactionResponse, type UnifiedBalance, type Wallet } from './api';
import './styles.css';

type WalletMap = Record<string, UnifiedBalance | undefined>;

export default function App() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [unifiedBalances, setUnifiedBalances] = useState<WalletMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('0.1');
  const [fromWalletId, setFromWalletId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);

  async function loadWallets(showSpinner = true) {
    try {
      setError('');
      if (showSpinner) setLoading(true);
      else setRefreshing(true);

      const data = await api.getWallets();
      setWallets(data.wallets);
      setFromWalletId((current) => current || data.wallets[0]?.id || '');
      setToAddress((current) => current || data.wallets[1]?.address || '');

      const balances = await Promise.all(
        data.wallets.map(async (wallet) => {
          try {
            return [wallet.id, await api.getUnifiedBalance(wallet.id)] as const;
          } catch {
            return [wallet.id, undefined] as const;
          }
        })
      );
      setUnifiedBalances(Object.fromEntries(balances));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadWallets();
  }, []);

  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING') return;

    const timer = window.setInterval(async () => {
      try {
        const next = await api.getTransaction(transaction.transactionId);
        setTransaction(next);
        if (next.status !== 'PENDING') {
          window.clearInterval(timer);
          void loadWallets(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh transaction status.');
        window.clearInterval(timer);
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [transaction]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setError('');
      setSubmitting(true);
      const created = await api.createTransfer({ fromWalletId, toAddress, amount });
      setTransaction({
        transactionId: created.transactionId,
        status: created.status,
        amount,
        destinationAddress: toAddress
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const senderWallet = useMemo(() => wallets.find((wallet) => wallet.id === fromWalletId) ?? wallets[0], [wallets, fromWalletId]);

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">Arc Testnet • Circle Wallets • USDC</p>
            <h1>NanoPay MVP</h1>
            <p className="subtitle">Micropayments demo for Wallet A → Wallet B with optional unified-balance fallback.</p>
          </div>
          <button className="secondary" onClick={() => void loadWallets(false)} disabled={refreshing || loading}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {error ? <div className="alert error">{error}</div> : null}

        {loading ? (
          <div className="panel">Loading wallets...</div>
        ) : (
          <>
            <section className="grid">
              {wallets.map((wallet) => {
                const unified = unifiedBalances[wallet.id];
                return (
                  <article key={wallet.id} className="card">
                    <div className="card-head">
                      <h2>{wallet.label}</h2>
                      <span className={wallet.label === 'Wallet A' ? 'badge owner' : 'badge recipient'}>
                        {wallet.label === 'Wallet A' ? 'Your wallet' : 'Recipient'}
                      </span>
                    </div>
                    <p className="mono small">{wallet.address}</p>
                    <div className="metric-row">
                      <div>
                        <span className="metric-label">Direct Arc balance</span>
                        <strong>{wallet.directBalance} USDC</strong>
                      </div>
                      <div>
                        <span className="metric-label">Unified balance</span>
                        <strong>{unified?.balance ?? wallet.directBalance} USDC</strong>
                      </div>
                    </div>
                    <div className="muted small">
                      {unified?.gatewayEnabled
                        ? 'Gateway enabled'
                        : unified?.note ?? 'Direct balance fallback'}
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="panel split">
              <div>
                <h2>Send payment</h2>
                <p className="muted">Send testnet USDC from Wallet A to any Arc-compatible EVM address.</p>
                <form className="form" onSubmit={handleSubmit}>
                  <label>
                    <span>From wallet</span>
                    <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)}>
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.label} — {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Destination address</span>
                    <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." />
                  </label>

                  <label>
                    <span>Amount (USDC)</span>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
                  </label>

                  <button className="primary" disabled={submitting || !senderWallet}>
                    {submitting ? 'Sending...' : 'Send payment'}
                  </button>
                </form>
              </div>

              <div className="status-panel">
                <h2>Transaction status</h2>
                {transaction ? (
                  <div className="status-box">
                    <div className={`status-pill ${transaction.status.toLowerCase()}`}>{transaction.status}</div>
                    <p><strong>Transaction ID:</strong> <span className="mono">{transaction.transactionId}</span></p>
                    <p><strong>Amount:</strong> {transaction.amount} USDC</p>
                    <p><strong>Destination:</strong> <span className="mono">{transaction.destinationAddress}</span></p>
                    {transaction.rawState ? <p><strong>Circle state:</strong> {transaction.rawState}</p> : null}
                    {transaction.txHash ? <p><strong>Tx hash:</strong> <span className="mono">{transaction.txHash}</span></p> : null}
                    {transaction.errorReason ? <p><strong>Error:</strong> {transaction.errorReason}</p> : null}
                    {transaction.status === 'PENDING' ? <p className="muted">Checking status every 2.5 seconds...</p> : null}
                  </div>
                ) : (
                  <div className="empty-state">No transfer submitted yet.</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
