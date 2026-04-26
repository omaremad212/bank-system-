import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-brand">
            <div className="login-brand-icon">&#x1F3E6;</div>
            <h1>PrimeBank</h1>
          </div>
          
          <h2>Welcome to PrimeBank</h2>
          <p>Your trusted digital banking partner. Access your accounts securely and manage your finances with ease.</p>
          
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4B0;</div>
              <div className="login-feature-text">
                <h4>Secure Banking</h4>
                <p>Your data is protected with bank-level security</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4B3;</div>
              <div className="login-feature-text">
                <h4>24/7 Access</h4>
                <p>Manage your accounts anytime, anywhere</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4E7;</div>
              <div className="login-feature-text">
                <h4>Instant Support</h4>
                <p>Get help from our dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card" style={{ maxWidth: '500px' }}>
          <div className="login-header">
            <span className="login-header-label">Welcome</span>
            <h2>Get Started</h2>
            <p>Choose your portal to continue</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/login/customer" className="login-btn" style={{ textDecoration: 'none' }}>
              <span>&#x1F464;</span>
              Customer Login
            </Link>
            <Link to="/login/employee" className="login-btn" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)' }}>
              <span>&#x1F468;&#x200D;&#x1F4BB;</span>
              Employee Login
            </Link>
          </div>

          <div className="login-hint" style={{ marginTop: '2rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;