import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { BankAccount, LoanApplication } from '../../types';

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
      <div className="welcome-section">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's an overview of your banking activities</p>
      </div>

      <div className="grid grid-3 mb-3">
        <div className="stat-card">
          <div className="stat-card-label">Total Balance</div>
          <div className="stat-card-value success">${totalBalance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Accounts</div>
          <div className="stat-card-value primary">{accounts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Loan Applications</div>
          <div className="stat-card-value">{loans.length}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Accounts</h3>
          </div>
          {accounts.length === 0 ? (
            <div className="empty-state">
              <p>No accounts yet</p>
            </div>
          ) : (
            accounts.slice(0, 3).map((account) => (
              <div key={account.AccountID} className="account-card">
                <div className="account-card-header">
                  <span className="account-number">{account.AccountNumber}</span>
                  <span className={`account-type ${account.type?.toLowerCase() || account.AccountType?.toLowerCase()}`}>
                    {account.type || account.AccountType}
                  </span>
                </div>
                <div className="account-balance">
                  ${(account.balance || 0).toLocaleString()}
                </div>
                <div className="account-balance-label">Current Balance</div>
                {account.InterestRate && (
                  <div className="text-sm text-muted">Interest Rate: {account.InterestRate}%</div>
                )}
                {account.OverdraftLimit && (
                  <div className="text-sm text-muted">Overdraft Limit: ${account.OverdraftLimit}</div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Loans</h3>
          </div>
          {loans.length === 0 ? (
            <div className="empty-state">
              <p>No loans yet</p>
            </div>
          ) : (
            loans.slice(0, 3).map((loan) => (
              <div key={loan.ApplicationID} className="account-card">
                <div className="account-card-header">
                  <span className="account-number">Loan #{loan.ApplicationID}</span>
                  <span className={`badge ${loan.ApprovedAmt ? 'badge-success' : 'badge-warning'}`}>
                    {loan.ApprovedAmt ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="account-balance">
                  ${loan.ApprovedAmt?.toLocaleString() || 'Amount not set'}
                </div>
                <div className="account-balance-label">
                  {loan.StartDate && loan.EndDate
                    ? `${loan.StartDate} - ${loan.EndDate}`
                    : 'Processing'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;