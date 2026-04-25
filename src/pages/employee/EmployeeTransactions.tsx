import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Transaction } from '../../types';

const EmployeeTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.admin.getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div>
          <h1>Transactions</h1>
          <p>View all transaction history</p>
        </div>
      </div>

      <div className="table-card">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
          </div>
) : (
          <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Account ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>ATM ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.TransactionID}>
                    <td>{transaction.TransactionID}</td>
                    <td>{formatDate(transaction.Date_Time)}</td>
                    <td>{transaction.AccountID}</td>
                    <td>
                      <span className={`badge badge-${transaction.TransactionType === 'Deposit' ? 'success' : transaction.TransactionType === 'Withdraw' ? 'danger' : 'primary'}`}>
                        {transaction.TransactionType}
                      </span>
                    </td>
                    <td>${transaction.Amount.toLocaleString()}</td>
                    <td>{transaction.ATMID || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
</table>
        )}
      </div>
    </div>
  );
};

export default EmployeeTransactions;
