import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'employee'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customerData, setCustomerData] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    street: '',
    area: '',
    state: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });

  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    departmentId: 1,
    password: '',
    confirmPassword: '',
  });

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (customerData.password !== customerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.signup.customer({
        nationalId: customerData.nationalId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        gender: customerData.gender,
        street: customerData.street,
        area: customerData.area,
        state: customerData.state,
        dateOfBirth: customerData.dateOfBirth,
        password: customerData.password,
      });
      navigate('/login/customer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (employeeData.password !== employeeData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.signup.employee({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        gender: employeeData.gender,
        email: employeeData.email,
        departmentId: employeeData.departmentId,
        password: employeeData.password,
      });
      navigate('/login/employee');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
          
          <h2>Join PrimeBank</h2>
          <p>Create your account and start banking with us.</p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card" style={{ maxWidth: '500px' }}>
          <div className="login-header">
            <span className="login-header-label">Create Account</span>
            <h2>Sign Up</h2>
            <p>Select your role to continue</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`login-btn ${role === 'customer' ? '' : ''}`}
              style={{ 
                flex: 1, 
                background: role === 'customer' 
                  ? 'var(--primary)' 
                  : 'var(--light)',
                color: role === 'customer' ? '#fff' : 'var(--text)',
                textDecoration: 'none'
              }}
            >
              <span>&#x1F464;</span>
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`login-btn ${role === 'employee' ? '' : ''}`}
              style={{ 
                flex: 1, 
                background: role === 'employee' 
                  ? 'var(--accent-green)' 
                  : 'var(--light)',
                color: role === 'employee' ? '#fff' : 'var(--text)',
                textDecoration: 'none'
              }}
            >
              <span>&#x1F468;&#x200D;&#x1F4BB;</span>
              Employee
            </button>
          </div>

          {role === 'customer' ? (
            <form onSubmit={handleCustomerSubmit}>
              <div className="form-group">
                <label>National ID</label>
                <input
                  type="text"
                  value={customerData.nationalId}
                  onChange={(e) => setCustomerData({ ...customerData, nationalId: e.target.value })}
                  placeholder="Enter your National ID"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={customerData.gender}
                  onChange={(e) => setCustomerData({ ...customerData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={customerData.dateOfBirth}
                  onChange={(e) => setCustomerData({ ...customerData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={customerData.street}
                  onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
                  placeholder="Street"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={customerData.area}
                    onChange={(e) => setCustomerData({ ...customerData, area: e.target.value })}
                    placeholder="Area"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={customerData.state}
                    onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={customerData.password}
                  onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                  placeholder="Create password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={customerData.confirmPassword}
                  onChange={(e) => setCustomerData({ ...customerData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                {loading ? 'Creating Account...' : 'Create Customer Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmployeeSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={employeeData.firstName}
                    onChange={(e) => setEmployeeData({ ...employeeData, firstName: e.target.value })}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={employeeData.lastName}
                    onChange={(e) => setEmployeeData({ ...employeeData, lastName: e.target.value })}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={employeeData.gender}
                  onChange={(e) => setEmployeeData({ ...employeeData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={employeeData.departmentId}
                  onChange={(e) => setEmployeeData({ ...employeeData, departmentId: parseInt(e.target.value) })}
                >
                  <option value={1}>HR Department</option>
                  <option value={2}>IT Department</option>
                  <option value={3}>Operations</option>
                  <option value={4}>Customer Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                  placeholder="Create password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={employeeData.confirmPassword}
                  onChange={(e) => setEmployeeData({ ...employeeData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                {loading ? 'Creating Account...' : 'Create Employee Account'}
              </button>
            </form>
          )}

          <div className="login-hint" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login/customer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;