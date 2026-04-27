import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    transactions: 0,
    loans: 0,
    employees: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, accounts, transactions, loans, employees] = await Promise.all([
          api.admin.getCustomers(),
          api.admin.getAccounts(),
          api.admin.getTransactions(),
          api.admin.getLoans(),
          api.admin.getEmployees(),
        ]);
        
        const totalBalance = Array.isArray(accounts) 
          ? accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0)
          : 0;
        
        setStats({
          customers: Array.isArray(customers) ? customers.length : 0,
          accounts: Array.isArray(accounts) ? accounts.length : 0,
          transactions: Array.isArray(transactions) ? transactions.length : 0,
          loans: Array.isArray(loans) ? loans.length : 0,
          employees: Array.isArray(employees) ? employees.length : 0,
          totalBalance,
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
        <h1>Welcome, {user?.name}!</h1>
        <p>{user?.roleType || 'Manager'} Dashboard</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F3E2;</span>
            <span>Main Branch - Cairo</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>Management Department</span>
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
          <div className="stat-card-label">Active in system</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Bank Accounts</h3>
          <div className="stat-card-value green">{stats.accounts}</div>
          <div className="stat-card-label">Total accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F4B0;</span>
            </div>
          </div>
          <h3>Total Balance</h3>
          <div className="stat-card-value cyan">${stats.totalBalance.toLocaleString()}</div>
          <div className="stat-card-label">In all accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <span>&#x1F3E2;</span>
            </div>
          </div>
          <h3>Loan Applications</h3>
          <div className="stat-card-value purple">{stats.loans}</div>
          <div className="stat-card-label">Applications</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon yellow">
              <span>&#x1F468;&#x200D;&#x1F4BB;</span>
            </div>
          </div>
          <h3>Employees</h3>
          <div className="stat-card-value yellow">{stats.employees}</div>
          <div className="stat-card-label">Staff members</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon red">
              <span>&#x1F4B8;</span>
            </div>
          </div>
          <h3>Transactions</h3>
          <div className="stat-card-value red">{stats.transactions}</div>
          <div className="stat-card-label">Total processed</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4B0;</span>
            Quick Actions
          </h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/manager/customers" className="btn btn-primary">
            <span>&#x1F465;</span> Manage Customers
          </Link>
          <Link to="/manager/accounts" className="btn btn-primary">
            <span>&#x1F4B3;</span> Manage Accounts
          </Link>
          <Link to="/manager/employees" className="btn btn-primary">
            <span>&#x1F468;&#x200D;&#x1F4BB;</span> Manage Employees
          </Link>
          <Link to="/manager/loans" className="btn btn-success">
            <span>&#x1F3E2;</span> Approve Loans
          </Link>
          <Link to="/manager/transactions" className="btn btn-secondary">
            <span>&#x1F4B0;</span> View Transactions
          </Link>
          <Link to="/manager/branches" className="btn btn-secondary">
            <span>&#x1F3E2;</span> Branches & Depts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;