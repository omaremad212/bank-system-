import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/employee' },
  { label: 'Customers', path: '/employee/customers' },
  { label: 'Accounts', path: '/employee/accounts' },
  { label: 'Transactions', path: '/employee/transactions' },
  { label: 'Loans', path: '/employee/loans' },
  { label: 'Employees', path: '/employee/employees' },
  { label: 'Branches', path: '/employee/branches' },
  { label: 'ATMs', path: '/employee/atms' },
];

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login/employee');
  };

  const currentPath = location.pathname === '/employee' ? '/employee' : location.pathname;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Bank Admin</h2>
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

export default EmployeeDashboard;