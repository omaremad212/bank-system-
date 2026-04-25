import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Customer, BankAccount, Transaction, LoanApplication } from '../../types';

const EmployeeHome = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, a, t, l] = await Promise.all([
          api.admin.getCustomers(),
          api.admin.getAccounts(),
          api.admin.getTransactions(),
          api.admin.getLoans(),
        ]);
        setCustomers(c);
        setAccounts(a);
        setTransactions(t);
        setLoans(l);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div>
      <div className="welcome-section">
        <h2>Welcome, {user?.name}!</h2>
        <p>
          {user?.roleType} | {user?.departmentName} | {user?.branchName}
        </p>
      </div>

      <div className="grid grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-card-label">Total Customers</div>
          <div className="stat-card-value primary">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Accounts</div>
          <div className="stat-card-value">{accounts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Balance</div>
          <div className="stat-card-value success">${totalBalance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Loan Applications</div>
          <div className="stat-card-value">{loans.length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
          </div>
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.TransactionID} className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold">{transaction.TransactionType}</div>
                <div className="text-sm text-muted">Account: {transaction.accountNumber || transaction.AccountID}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${transaction.Amount.toLocaleString()}</div>
                <div className="text-sm text-muted">
                  {new Date(transaction.Date_Time).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Loan Applications</h3>
          </div>
          {loans.slice(0, 5).map((loan) => (
            <div key={loan.ApplicationID} className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold">Loan #{loan.ApplicationID}</div>
                <div className="text-sm text-muted">Customer: {loan.customerName || loan.CustomerID}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${loan.ApprovedAmt?.toLocaleString() || 'Pending'}</div>
                <span className={`badge ${loan.ApprovedAmt ? 'badge-success' : 'badge-warning'}`}>
                  {loan.ApprovedAmt ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
