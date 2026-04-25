import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/employee');
  };

  const navItems = [
    { path: '/employee', label: 'Dashboard', icon: '\u2302' },
    { path: '/employee/customers', label: 'Customers', icon: '\u{1F465}' },
    { path: '/employee/accounts', label: 'Accounts', icon: '\u{1F4B3}' },
    { path: '/employee/transactions', label: 'Transactions', icon: '\u{1F4B0}' },
    { path: '/employee/loans', label: 'Loans', icon: '\u{1F3E2}' },
    { path: '/employee/employees', label: 'Employees', icon: '\u{1F468}\u200D\u{1F4BB}' },
    { path: '/employee/branches', label: 'Branches', icon: '\u{1F3E2}' },
    { path: '/employee/atms', label: 'ATMs', icon: '\u{1F5FE}' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">&#x1F3E6;</div>
          <div className="sidebar-brand">
            <h2>PrimeBank</h2>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Overview</div>
            <Link
              to="/employee"
              className={`nav-item ${location.pathname === '/employee' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x2302;</span>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            <Link
              to="/employee/customers"
              className={`nav-item ${location.pathname === '/employee/customers' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F465;</span>
              <span>Customers</span>
            </Link>
            <Link
              to="/employee/accounts"
              className={`nav-item ${location.pathname === '/employee/accounts' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F4B3;</span>
              <span>Accounts</span>
            </Link>
            <Link
              to="/employee/employees"
              className={`nav-item ${location.pathname === '/employee/employees' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F468;&#x200D;&#x1F4BB;</span>
              <span>Employees</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Operations</div>
            <Link
              to="/employee/transactions"
              className={`nav-item ${location.pathname === '/employee/transactions' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F4B0;</span>
              <span>Transactions</span>
            </Link>
            <Link
              to="/employee/loans"
              className={`nav-item ${location.pathname === '/employee/loans' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F3E2;</span>
              <span>Loans</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Infrastructure</div>
            <Link
              to="/employee/branches"
              className={`nav-item ${location.pathname === '/employee/branches' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F3E2;</span>
              <span>Branches</span>
            </Link>
            <Link
              to="/employee/atms"
              className={`nav-item ${location.pathname === '/employee/atms' ? 'active' : ''}`}
            >
              <span className="nav-item-icon">&#x1F5FE;</span>
              <span>ATMs</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name ? getInitials(user.name) : 'A'}
            </div>
            <div className="sidebar-user-info">
              <h4>{user?.name}</h4>
              <p>{user?.roleType || 'Admin'}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>&#x274C;</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-wrapper">
        <header className="main-header">
          <div className="main-header-left">
            <h1>
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="main-header-right">
            <button className="header-btn">
              &#x1F4E7;
            </button>
            <button className="header-btn">
              &#x1F514;
              <span className="badge">5</span>
            </button>
          </div>
        </header>

        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;