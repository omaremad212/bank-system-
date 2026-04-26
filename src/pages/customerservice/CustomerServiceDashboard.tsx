import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CustomerServiceDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    transactions: 0,
    pendingLoans: 0,
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersData, accountsData, transactionsData, loansData] = await Promise.all([
          api.admin.getCustomers(),
          api.admin.getAccounts(),
          api.admin.getTransactions(),
          api.admin.getLoans(),
        ]);
        
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setStats({
          customers: Array.isArray(customersData) ? customersData.length : 0,
          accounts: Array.isArray(accountsData) ? accountsData.length : 0,
          transactions: Array.isArray(transactionsData) ? transactionsData.length : 0,
          pendingLoans: Array.isArray(loansData) ? loansData.filter((l: any) => l.Status === 'Pending').length : 0,
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
        <p>Customer Service Department - Support & Inquiries</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>Customer Service Dept</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4AD;</span>
            <span>Support Center</span>
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
          <h3>Customers</h3>
          <div className="stat-card-value blue">{stats.customers}</div>
          <div className="stat-card-label">Registered</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Accounts</h3>
          <div className="stat-card-value green">{stats.accounts}</div>
          <div className="stat-card-label">Active accounts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <span>&#x23F0;</span>
            </div>
          </div>
          <h3>Pending Loans</h3>
          <div className="stat-card-value purple">{stats.pendingLoans}</div>
          <div className="stat-card-label">Awaiting approval</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon cyan">
              <span>&#x1F4B0;</span>
            </div>
          </div>
          <h3>Transactions</h3>
          <div className="stat-card-value cyan">{stats.transactions}</div>
          <div className="stat-card-label">Processed</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4DE;</span>
            Customer Inquiries
          </h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>Recent customer registrations:</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>National ID</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 5).map((customer: any) => (
                <tr key={customer.customerid || customer.id}>
                  <td>{customer.customerid || customer.id}</td>
                  <td>{customer.firstname && customer.lastname ? `${customer.firstname} ${customer.lastname}` : '-'}</td>
                  <td>{customer.nationalid || '-'}</td>
                  <td>{customer.phones?.[0] || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;