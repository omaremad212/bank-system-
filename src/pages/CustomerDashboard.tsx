import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/customer');
  };

  const navItems = [
    { path: '/customer', label: 'Dashboard', icon: '\u2302' },
    { path: '/customer/accounts', label: 'Accounts', icon: '\u{1F4B3}' },
    { path: '/customer/transactions', label: 'Transactions', icon: '\u{1F4B0}' },
    { path: '/customer/loans', label: 'Loans', icon: '\u{1F3E6}' },
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
            <p>Customer Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
            <div className="sidebar-user-info">
              <h4>{user?.name}</h4>
              <p>{user?.nationalId || 'Customer'}</p>
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
              <span className="badge">3</span>
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

export default CustomerDashboard;