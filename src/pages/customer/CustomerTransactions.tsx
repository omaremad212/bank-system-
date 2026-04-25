import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Transaction, BankAccount } from '../../types';

const CustomerTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData] = await Promise.all([
          api.customer.getAccounts(),
        ]);
        setAccounts(accData);
        
        let allTransactions: Transaction[] = [];
        for (const account of accData) {
          const txs = await api.customer.getTransactions(account.AccountID);
          allTransactions = [...allTransactions, ...txs];
        }
        setTransactions(allTransactions.sort((a, b) => 
          new Date(b.Date_Time).getTime() - new Date(a.Date_Time).getTime()
        ));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTransactions = selectedAccount === 0
    ? transactions
    : transactions.filter((t) => t.AccountID === selectedAccount);

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
          <p>View your transaction history</p>
        </div>
      </div>

      <div className="table-card mb-3">
        <div className="flex items-center gap-2">
          <label>Filter by Account:</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-300)' }}
          >
            <option value={0}>All Accounts</option>
            {accounts.map((account) => (
              <option key={account.AccountID} value={account.AccountID}>
                {account.AccountNumber} ({account.AccountTypeName || account.AccountType})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
          </div>
        ) : (
          <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => {
                  const account = accounts.find((a) => a.AccountID === transaction.AccountID);
                  return (
                    <tr key={transaction.TransactionID}>
                      <td>{formatDate(transaction.Date_Time)}</td>
                      <td>{account?.AccountNumber || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${transaction.TransactionType === 'Deposit' ? 'success' : transaction.TransactionType === 'Withdraw' ? 'danger' : 'primary'}`}>
                          {transaction.TransactionType}
                        </span>
                      </td>
                      <td className={transaction.TransactionType === 'Withdraw' || transaction.TransactionType === 'Transfer' ? 'text-danger' : ''}>
                        {transaction.TransactionType === 'Withdraw' || transaction.TransactionType === 'Transfer' ? '-' : '+'}
                        ${transaction.Amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default CustomerTransactions;