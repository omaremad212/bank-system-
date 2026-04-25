import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { customers } from '../data/customers';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login.customer(nationalId, password);
      
      if (result && result.token && result.user) {
        login(result.user);
        navigate('/customer');
      } else {
        setError(result?.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-brand">
            <div className="login-brand-icon">&#x1F3E6;</div>
            <h1>PrimeBank</h1>
          </div>
          
          <h2>Welcome to Your Digital Banking Portal</h2>
          <p>Manage your finances with our secure, modern banking platform designed for the way you live.</p>
          
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4B0;</div>
              <div className="login-feature-text">
                <h4>Instant Account Access</h4>
                <p>View balances and transactions in real-time</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4B3;</div>
              <div className="login-feature-text">
                <h4>Secure Money Transfers</h4>
                <p>Send money anywhere with complete peace of mind</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F3E2;</div>
              <div className="login-feature-text">
                <h4>24/7 Customer Support</h4>
                <p>We're always here to help with any questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <div className="login-header">
            <span className="login-header-label">Customer Portal</span>
            <h2>Welcome Back</h2>
            <p>Sign in to access your accounts</p>
          </div>

          {error && (
            <div className="login-error">
              <span>&#x26A0;</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>National ID</label>
              <div className="input-wrapper">
                <span className="input-icon">&#x1F464;</span>
                <input
                  type="text"
                  className="form-input"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Enter your National ID"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">&#x1F512;</span>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span>&#x2192;</span>}
            </button>
          </form>

          <div className="login-demo-box">
            <h4>&#x1F4A1; Demo Credentials</h4>
            <p>Use any of these National IDs with password: <strong>0000</strong></p>
            <div className="demo-ids">
              {customers.map((c) => (
                <button 
                  key={c.CustomerID} 
                  type="button"
                  className="demo-id-btn"
                  onClick={() => {
                    setNationalId(c.NationalID);
                    setPassword('0000');
                  }}
                >
                  <span className="demo-id-name">{c.FirstName} {c.LastName}</span>
                  <span className="demo-id-value">{c.NationalID}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <p>
              Are you an employee?{' '}
              <a href="/login/employee">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;