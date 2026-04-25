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
      setMessage(error.response?.data?.error || 'Transaction failed. Please try again.');
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
              <span className={`account-type ${account.AccountTypeName?.toLowerCase() || account.AccountType?.toLowerCase()}`}>
                {account.AccountTypeName || account.AccountType}
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

            {account.additional_info && (
              <div className="mt-2 text-sm text-muted">
                {account.AccountTypeName === 'Savings' 
                  ? `Interest Rate: ${account.additional_info}%`
                  : `Overdraft Limit: $${account.additional_info}`
                }
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
                    <label>Recipient Account ID</label>
                    <input
                      type="number"
                      value={recipientAccountId}
                      onChange={(e) => setRecipientAccountId(e.target.value)}
                      placeholder="Enter recipient account ID"
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