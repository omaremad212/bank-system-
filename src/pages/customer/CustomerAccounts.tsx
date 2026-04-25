import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BankAccount } from '../../types';

const CustomerAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const customerId = (user as any).CustomerID || 1;
        const data = await api.accounts.getByCustomerId(customerId);
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [user]);

  const handleAction = (account: BankAccount, type: 'deposit' | 'withdraw' | 'transfer') => {
    setSelectedAccount(account);
    setModalType(type);
    setAmount('');
    setRecipientAccount('');
    setMessage('');
    setSuccess(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !amount) return;

    try {
      const transactionType = modalType === 'transfer' ? 'Transfer' : modalType.charAt(0).toUpperCase() + modalType.slice(1) as 'Deposit' | 'Withdraw' | 'Transfer';
      await api.transactions.create({
        Amount: parseFloat(amount),
        TransactionType: transactionType as 'Deposit' | 'Withdraw' | 'Transfer',
        AccountID: selectedAccount.AccountID,
      });

      setSuccess(true);
      setMessage(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} successful!`);

      const customerId = (user as any).CustomerID || 1;
      const updatedAccounts = await api.accounts.getByCustomerId(customerId);
      setAccounts(updatedAccounts);
    } catch (error) {
      setMessage('Transaction failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Your Accounts</h1>
          <p>Manage your bank accounts</p>
        </div>
      </div>

      <div className="grid grid-2">
        {accounts.map((account) => (
          <div key={account.AccountID} className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{account.AccountNumber}</h3>
                <p className="text-muted text-sm">Opened on {account.OpenDate}</p>
              </div>
              <span className={`account-type ${account.AccountType.toLowerCase()}`}>
                {account.AccountType}
              </span>
            </div>

            <div className="mb-2">
              <div className="account-balance">${(account.balance || 0).toLocaleString()}</div>
              <div className="account-balance-label">Current Balance</div>
            </div>

            <div className="flex gap-1">
              <button
                className="btn btn-success"
                onClick={() => handleAction(account, 'deposit')}
              >
                Deposit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleAction(account, 'withdraw')}
              >
                Withdraw
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleAction(account, 'transfer')}
              >
                Transfer
              </button>
            </div>

            {account.interestRate && (
              <div className="mt-2 text-sm text-muted">
                Interest Rate: {account.interestRate}%
              </div>
            )}
            {account.overdraftLimit && (
              <div className="mt-2 text-sm text-muted">
                Overdraft Limit: ${account.overdraftLimit}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-2">
                  <label>Account</label>
                  <input
                    type="text"
                    value={selectedAccount?.AccountNumber || ''}
                    disabled
                  />
                </div>
                <div className="form-group mb-2">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                {modalType === 'transfer' && (
                  <div className="form-group mb-2">
                    <label>Recipient Account Number</label>
                    <input
                      type="text"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                )}
                {message && (
                  <div className={`badge ${success ? 'badge-success' : 'badge-danger'}`}>
                    {message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAccounts;