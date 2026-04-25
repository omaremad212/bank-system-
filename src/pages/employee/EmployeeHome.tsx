import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const EmployeeHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    transactions: 0,
    loans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, accounts, transactions, loans] = await Promise.all([
          api.admin.getCustomers().catch(() => []),
          api.admin.getAccounts().catch(() => []),
          api.admin.getTransactions().catch(() => []),
          api.admin.getLoans().catch(() => []),
        ]);
        setStats({
          customers: Array.isArray(customers) ? customers.length : 0,
          accounts: Array.isArray(accounts) ? accounts.length : 0,
          transactions: Array.isArray(transactions) ? transactions.length : 0,
          loans: Array.isArray(loans) ? loans.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's an overview of the banking system</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F3E2;</span>
            <span>{user?.branchName || 'All Branches'}</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>{user?.roleType || 'Admin'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">
              <span>&#x1F465;</span>
            </div>
          </div>
          <h3>Total Customers</h3>
          <div className="stat-card-value blue">{stats.customers}</div>
          <div className="stat-card-label">Active accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Bank Accounts</h3>
          <div className="stat-card-value green">{stats.accounts}</div>
          <div className="stat-card-label">Savings & Checking</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F4B0;</span>
            </div>
          </div>
          <h3>Transactions</h3>
          <div className="stat-card-value cyan">{stats.transactions}</div>
          <div className="stat-card-label">Total processed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <span>&#x1F3E2;</span>
            </div>
          </div>
          <h3>Loan Applications</h3>
          <div className="stat-card-value purple">{stats.loans}</div>
          <div className="stat-card-label">Applications received</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">
              <span>&#x1F4B8;</span>
            </div>
          </div>
          <h3>Total Deposits</h3>
          <div className="stat-card-value yellow">$125,430</div>
          <div className="stat-card-label">This month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon red">
              <span>&#x1F4B7;</span>
            </div>
          </div>
          <h3>Total Withdrawals</h3>
          <div className="stat-card-value red">$48,200</div>
          <div className="stat-card-label">This month</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;