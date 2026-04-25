import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const TellerDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, txData] = await Promise.all([
          api.admin.getAccounts(),
          api.admin.getTransactions(),
        ]);
        setAccounts(accData || []);
        setTransactions(txData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTransaction = (account: any, type: 'deposit' | 'withdraw') => {
    setSelectedAccount(account);
    setModalType(type);
    setAmount('');
    setMessage('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !amount) return;

    try {
      if (modalType === 'deposit') {
        await api.customer.deposit(selectedAccount.AccountID, parseFloat(amount));
        setMessage('Deposit successful!');
      } else {
        await api.customer.withdraw(selectedAccount.AccountID, parseFloat(amount));
        setMessage('Withdrawal successful!');
      }
      const [accData, txData] = await Promise.all([
        api.admin.getAccounts(),
        api.admin.getTransactions(),
      ]);
      setAccounts(accData || []);
      setTransactions(txData || []);
    } catch (error: any) {
      setMessage(error?.response?.data?.error || 'Transaction failed');
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
        <h1>Welcome, {user?.name}!</h1>
        <p>Teller Transactions Dashboard</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F3E2;</span>
            <span>Main Branch - Cairo</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>Operations Department</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Accounts</h3>
          <div className="stat-card-value green">{accounts.length}</div>
          <div className="stat-card-label">Available</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F4B0;</span>
            </div>
          </div>
          <h3>Transactions Today</h3>
          <div className="stat-card-value cyan">{transactions.length}</div>
          <div className="stat-card-label">Processed</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4B3;</span>
            Account Balances
          </h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account #</th>
                <th>Customer</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account: any) => (
                <tr key={account.AccountID}>
                  <td>{account.AccountNumber}</td>
                  <td>{account.customerName}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                    ${(account.balance || 0).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleTransaction(account, 'deposit')}
                      >
                        &#x2191; Deposit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleTransaction(account, 'withdraw')}
                      >
                        &#x2193; Withdraw
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4B0;</span>
            Recent Transactions
          </h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx: any) => (
                <tr key={tx.TransactionID}>
                  <td>#{tx.TransactionID}</td>
                  <td>{tx.accountNumber}</td>
                  <td>
                    <span className={`badge ${tx.TransactionType === 'Deposit' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.TransactionType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${tx.Amount.toLocaleString()}</td>
                  <td>{tx.Date_Time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'deposit' ? 'Deposit' : 'Withdraw'} Money</h3>
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
                  <label>Customer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedAccount?.customerName || ''}
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
                {message && (
                  <div className="login-error">
                    <span>{message.includes('success') ? '&#x2713;' : '&#x26A0;'}</span>
                    {message}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TellerDashboard;