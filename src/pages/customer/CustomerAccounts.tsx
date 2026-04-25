import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BankAccount } from '../../types';

const CustomerAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [recipientAccountId, setRecipientAccountId] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.customer.getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleAction = (account: BankAccount, type: 'deposit' | 'withdraw' | 'transfer') => {
    setSelectedAccount(account);
    setModalType(type);
    setAmount('');
    setRecipientAccountId('');
    setMessage('');
    setSuccess(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !amount) return;

    try {
      if (modalType === 'deposit') {
        await api.customer.deposit(selectedAccount.AccountID, parseFloat(amount));
      } else if (modalType === 'withdraw') {
        await api.customer.withdraw(selectedAccount.AccountID, parseFloat(amount));
      } else if (modalType === 'transfer') {
        await api.customer.transfer(
          selectedAccount.AccountID,
          parseInt(recipientAccountId),
          parseFloat(amount)
        );
      }

      setSuccess(true);
      setMessage(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} successful!`);

      const updatedAccounts = await api.customer.getAccounts();
      setAccounts(updatedAccounts);
    } catch (error: any) {
      setSuccess(false);
      setMessage(error?.response?.data?.error || 'Transaction failed. Please try again.');
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
      <div className="welcome-hero">
        <h1>Your Accounts</h1>
        <p>Manage your bank accounts, deposit, withdraw, and transfer money</p>
      </div>

      <div className="account-grid">
        {accounts.length === 0 ? (
          <div className="table-card">
            <div className="empty-state">
              <div className="empty-state-icon">&#x1F4B3;</div>
              <h3>No Accounts Found</h3>
              <p>You don't have any bank accounts yet.</p>
            </div>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.AccountID} className="account-card">
              <div className="account-card-header">
                <span className="account-card-number">{account.AccountNumber}</span>
                <span className={`account-card-type ${(account.AccountType || 'savings').toLowerCase()}`}>
                  {account.AccountType}
                </span>
              </div>
              <div className="account-card-balance">
                <div className="account-card-balance-label">Current Balance</div>
                <div className="account-card-balance-value">
                  ${(account.balance || 0).toLocaleString()}
                </div>
              </div>
              <div className="account-card-details">
                <div className="account-card-detail">
                  <label>Interest Rate</label>
                  <span>{account.interestRate ? `${account.interestRate}%` : account.overdraftLimit ? `Overdraft: $${account.overdraftLimit}` : '-'}</span>
                </div>
                <div className="account-card-detail">
                  <label>Opened</label>
                  <span>{account.OpenDate}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-success"
                  onClick={() => handleAction(account, 'deposit')}
                >
                  <span>&#x2191;</span> Deposit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleAction(account, 'withdraw')}
                >
                  <span>&#x2193;</span> Withdraw
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleAction(account, 'transfer')}
                >
                  <span>&#x1F4B0;</span> Transfer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &#x2715;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label>Account</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedAccount?.AccountNumber || ''}
                    disabled
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                {modalType === 'transfer' && (
                  <div className="form-group mb-3">
                    <label>Recipient Account ID</label>
                    <input
                      type="number"
                      className="form-input"
                      value={recipientAccountId}
                      onChange={(e) => setRecipientAccountId(e.target.value)}
                      placeholder="Enter account ID"
                      required
                    />
                  </div>
                )}
                {message && (
                  <div className={`login-error ${success ? 'login-success' : ''}`}>
                    <span>{success ? '&#x2713;' : '&#x26A0;'}</span>
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