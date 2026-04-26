import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login.employee(employeeId, password);
      
      if (result && result.token && result.user) {
        login(result.user);
        navigate('/employee');
      } else {
        const msg = result?.message || result?.error || 'Invalid credentials';
        setError(String(msg));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = 
        err?.response?.data?.message || 
        err?.response?.data?.error || 
        err?.message || 
        err?.error ||
        'Login failed. Please try again.';
      setError(String(message));
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
          
          <h2>Employee Portal</h2>
          <p>Access the administrative dashboard to manage accounts and operations.</p>
          
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F465;</div>
              <div className="login-feature-text">
                <h4>Customer Management</h4>
                <p>Add, edit, and manage customer accounts</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4CA;</div>
              <div className="login-feature-text">
                <h4>Real-time Analytics</h4>
                <p>Monitor transactions and system performance</p>
              </div>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">&#x1F4B0;</div>
              <div className="login-feature-text">
                <h4>Loan Processing</h4>
                <p>Review and approve loan applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <div className="login-header">
            <span className="login-header-label">Employee Portal</span>
            <h2>Employee Login</h2>
            <p>Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="login-error">
              <span>&#x26A0;</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Employee ID</label>
              <div className="input-wrapper">
                <span className="input-icon">&#x1F464;</span>
                <input
                  type="text"
                  className="form-input"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EmployeeID (e.g. 1)"
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

          <div className="login-hint">
            Demo password: <strong>0000</strong>
          </div>

          <div className="login-footer">
            <p>
              Are you a customer?{' '}
              <a href="/login/customer">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;