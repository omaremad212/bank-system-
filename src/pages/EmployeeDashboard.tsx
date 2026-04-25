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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const role = user?.roleType || 'Employee';
  const isManager = role === 'Manager';
  const isClerk = role === 'Clerk';
  const isTeller = role === 'Teller';

  const managerNavItems = [
    { path: '/employee', label: 'Dashboard', icon: '\u2302', section: 'overview' },
    { path: '/employee/customers', label: 'Customers', icon: '\u{1F465}', section: 'management' },
    { path: '/employee/accounts', label: 'Accounts', icon: '\u{1F4B3}', section: 'management' },
    { path: '/employee/transactions', label: 'Transactions', icon: '\u{1F4B0}', section: 'operations' },
    { path: '/employee/loans', label: 'Loan Applications', icon: '\u{1F3E2}', section: 'operations' },
    { path: '/employee/employees', label: 'Employees', icon: '\u{1F468}\u200D\u{1F4BB}', section: 'management' },
    { path: '/employee/branches', label: 'Branches', icon: '\u{1F3E2}', section: 'infrastructure' },
    { path: '/employee/atms', label: 'ATMs', icon: '\u{1F5FE}', section: 'infrastructure' },
  ];

  const clerkNavItems = [
    { path: '/employee', label: 'Dashboard', icon: '\u2302', section: 'overview' },
    { path: '/employee/customers', label: 'Customers', icon: '\u{1F465}', section: 'management' },
    { path: '/employee/accounts', label: 'Accounts', icon: '\u{1F4B3}', section: 'management' },
  ];

  const tellerNavItems = [
    { path: '/employee', label: 'Dashboard', icon: '\u2302', section: 'overview' },
    { path: '/employee/transactions', label: 'Transactions', icon: '\u{1F4B0}', section: 'operations' },
  ];

  const navItems = isManager ? managerNavItems : isClerk ? clerkNavItems : tellerNavItems;

  const pageTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';
  const currentSection = navItems.find(item => item.path === location.pathname)?.section;

  const sections = [...new Set(navItems.map(item => item.section))];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">&#x1F3E6;</div>
          <div className="sidebar-brand">
            <h2>PrimeBank</h2>
            <p>{role} Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section} className="nav-section">
              <div className="nav-section-title">
                {section === 'overview' ? 'Overview' :
                 section === 'management' ? 'Management' :
                 section === 'operations' ? 'Operations' :
                 'Infrastructure'}
              </div>
              {navItems.filter(item => item.section === section).map((item) => (
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
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name ? getInitials(user.name) : 'A'}
            </div>
            <div className="sidebar-user-info">
              <h4>{user?.name}</h4>
              <p>{role}</p>
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
            <p>Welcome back, {user?.name} - {user?.departmentName || 'Employee'}</p>
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

export default EmployeeDashboard;