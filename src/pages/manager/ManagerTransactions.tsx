import { useState, useEffect } from 'react';
import api from '../../services/api';

const ManagerTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    accountId: 0,
    transactionType: 'Deposit',
    amount: 0,
    atmId: 1,
  });

  const fetchData = async () => {
    try {
      const [transactionsData, accountsData] = await Promise.all([
        api.admin.getTransactions(),
        api.admin.getAccounts(),
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createTransaction(formData);
      setShowModal(false);
      setFormData({
        accountId: 0,
        transactionType: 'Deposit',
        amount: 0,
        atmId: 1,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating transaction:', error);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#1a365d', marginBottom: '0.5rem' }}>Transaction History</h2>
          <p style={{ color: '#718096' }}>View all transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>+</span> Create Transaction
        </button>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
              <th>ATM Location</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => (
              <tr key={tx.TransactionID}>
                <td>{tx.TransactionID}</td>
                <td>{tx.Date_Time}</td>
                <td>{tx.accountNumber}</td>
                <td>
                  <span className={`badge ${tx.TransactionType === 'Deposit' ? 'badge-success' : 'badge-warning'}`}>
                    {tx.TransactionType}
                  </span>
                </td>
                <td>${tx.Amount?.toLocaleString()}</td>
                <td>{tx.atmLocation || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Transaction</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Account</label>
                  <select
                    className="form-select"
                    value={formData.accountId}
                    onChange={e => setFormData({ ...formData, accountId: Number(e.target.value) })}
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((a: any) => (
                      <option key={a.AccountID} value={a.AccountID}>
                        {a.AccountNumber} - {a.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Transaction Type</label>
                  <select
                    className="form-select"
                    value={formData.transactionType}
                    onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdraw">Withdraw</option>
                  </select>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTransactions;