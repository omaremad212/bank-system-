import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const navItems = [
  { label: 'Dashboard', path: '/customer' },
  { label: 'Accounts', path: '/customer/accounts' },
  { label: 'Transactions', path: '/customer/transactions' },
  { label: 'Loans', path: '/customer/loans' },
];

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login/customer');
  };

  const currentPath = location.pathname === '/customer' ? '/customer' : location.pathname;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Bank System</h2>
          <p>Welcome, {user?.name}</p>
        </div>
        
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={currentPath === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <div style={{ marginTop: 'auto', padding: '0 1.5rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary btn-block">
            Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerDashboard;