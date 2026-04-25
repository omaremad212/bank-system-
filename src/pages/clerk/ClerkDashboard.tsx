import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ClerkDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/employee');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navItems = [
    { path: '/clerk/dashboard', label: 'Dashboard', icon: '\u2302' },
    { path: '/clerk/customers', label: 'Customers', icon: '\u{1F465}' },
    { path: '/clerk/accounts', label: 'Accounts', icon: '\u{1F4B3}' },
  ];

  const pageTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">&#x1F3E6;</div>
          <div className="sidebar-brand">
            <h2>PrimeBank</h2>
            <p>Clerk Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Management</div>
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
              {user?.name ? getInitials(user.name) : 'C'}
            </div>
            <div className="sidebar-user-info">
              <h4>{user?.name}</h4>
              <p>Clerk</p>
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
            <h1>{pageTitle}</h1>
            <p>{user?.name} - Customer Service</p>
          </div>
          <div className="main-header-right">
            <button className="header-btn">
              &#x1F4E7;
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

export default ClerkDashboard;