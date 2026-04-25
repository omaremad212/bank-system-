import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BankAccount, LoanApplication } from '../../types';
import { Link } from 'react-router-dom';

const CustomerHome = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, loanData] = await Promise.all([
          api.customer.getAccounts(),
          api.customer.getLoans(),
        ]);
        setAccounts(accData);
        setLoans(loanData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
      <div className="welcome-hero">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's an overview of your banking activities</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F4C5;</span>
            <span>Last login: Today</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F3E2;</span>
            <span>{user?.state || 'Cairo'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B0;</span>
            </div>
            <div className="stat-card-trend up">
              <span>&#x2191;</span>
              <span>Active</span>
            </div>
          </div>
          <h3>Total Balance</h3>
          <div className="stat-card-value green">${totalBalance.toLocaleString()}</div>
          <div className="stat-card-label">Across all accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Active Accounts</h3>
          <div className="stat-card-value blue">{accounts.length}</div>
          <div className="stat-card-label">Savings & Checking</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <span>&#x1F3E2;</span>
            </div>
          </div>
          <h3>Loan Applications</h3>
          <div className="stat-card-value purple">{loans.length}</div>
          <div className="stat-card-label">
            {loans.filter(l => l.ApprovedAmt).length} approved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F514;</span>
            </div>
          </div>
          <h3>Notifications</h3>
          <div className="stat-card-value cyan">3</div>
          <div className="stat-card-label">Unread messages</div>
        </div>
      </div>

      <div className="account-grid">
        {accounts.length === 0 ? (
          <div className="table-card">
            <div className="empty-state">
              <div className="empty-state-icon">&#x1F4B3;</div>
              <h3>No Accounts Yet</h3>
              <p>You don't have any accounts. Contact your bank to open an account.</p>
            </div>
          </div>
        ) : (
          accounts.slice(0, 4).map((account) => (
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
            </div>
          ))
        )}
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F3E2;</span>
            Loan Applications
          </h3>
          <Link to="/customer/loans" className="btn btn-secondary">
            View All
          </Link>
        </div>
        <div className="table-container">
          {loans.length === 0 ? (
            <div className="empty-state">
              <h3>No Loan Applications</h3>
              <p>You haven't applied for any loans yet.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applied Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {loans.slice(0, 5).map((loan) => (
                  <tr key={loan.ApplicationID}>
                    <td>#{loan.ApplicationID}</td>
                    <td>{loan.AppDate}</td>
                    <td>${loan.ApprovedAmt?.toLocaleString() || 'Pending'}</td>
                    <td>
                      <span className={`badge ${
                        loan.ApprovedAmt ? 'badge-success' : 'badge-warning'
                      }`}>
                        {loan.ApprovedAmt ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {loan.StartDate && loan.EndDate 
                        ? `${loan.StartDate} - ${loan.EndDate}`
                        : 'Processing'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;