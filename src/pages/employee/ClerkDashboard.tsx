import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const ClerkDashboard = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custData, accData] = await Promise.all([
          api.admin.getCustomers(),
          api.admin.getAccounts(),
        ]);
        setCustomers(custData || []);
        setAccounts(accData || []);
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

  return (
    <div>
      <div className="welcome-hero">
        <h1>Welcome, {user?.name}!</h1>
        <p>Customer Service Dashboard</p>
        <div className="welcome-hero-info">
          <div className="welcome-info-item">
            <span>&#x1F3E2;</span>
            <span>Main Branch - Cairo</span>
          </div>
          <div className="welcome-info-item">
            <span>&#x1F4BC;</span>
            <span>Customer Service Department</span>
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
          <div className="stat-card-value blue">{customers.length}</div>
          <div className="stat-card-label">In system</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <span>&#x1F4B3;</span>
            </div>
          </div>
          <h3>Bank Accounts</h3>
          <div className="stat-card-value green">{accounts.length}</div>
          <div className="stat-card-label">Opened</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F465;</span>
            Recent Customers
          </h3>
          <Link to="/employee/customers" className="btn btn-primary">
            View All Customers
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>National ID</th>
                <th>Gender</th>
                <th>State</th>
                <th>Accounts</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 5).map((customer) => (
                <tr key={customer.CustomerID}>
                  <td>#{customer.CustomerID}</td>
                  <td>{customer.FirstName} {customer.LastName}</td>
                  <td>{customer.NationalID}</td>
                  <td>{customer.Gender}</td>
                  <td>{customer.State}</td>
                  <td>{accounts.filter(a => a.CustomerID === customer.CustomerID).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">
            <span>&#x1F4B3;</span>
            Recent Accounts
          </h3>
          <Link to="/employee/accounts" className="btn btn-secondary">
            View All Accounts
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account #</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Balance</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {accounts.slice(0, 5).map((account: any) => (
                <tr key={account.AccountID}>
                  <td>{account.AccountNumber}</td>
                  <td>
                    <span className={`account-card-type ${account.AccountType?.toLowerCase()}`}>
                      {account.AccountType}
                    </span>
                  </td>
                  <td>{account.customerName}</td>
                  <td>${(account.balance || 0).toLocaleString()}</td>
                  <td>{account.OpenDate}</td>
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
            Quick Actions
          </h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/employee/customers" className="btn btn-primary">
            <span>&#x1F465;</span> Create Customer
          </Link>
          <Link to="/employee/accounts" className="btn btn-primary">
            <span>&#x1F4B3;</span> Open Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard;