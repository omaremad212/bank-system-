import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface FormErrors {
  [key: string]: string;
}

const SignUp = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'employee'>('customer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

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

  const validateCustomerForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerData.nationalId.trim()) {
      newErrors.nationalId = 'National ID is required';
    } else if (customerData.nationalId.length < 10) {
      newErrors.nationalId = 'National ID must be at least 10 characters';
    }

    if (!customerData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!customerData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!customerData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!customerData.password) {
      newErrors.password = 'Password is required';
    } else if (customerData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (customerData.password !== customerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmployeeForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!employeeData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!employeeData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!employeeData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!employeeData.password) {
      newErrors.password = 'Password is required';
    } else if (employeeData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (employeeData.password !== employeeData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateCustomerForm()) {
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
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login/customer'), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateEmployeeForm()) {
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
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login/employee'), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    data: any,
    field: string,
    value: string
  ) => {
    setter({ ...data, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const renderInput = (
    label: string,
    field: string,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false,
    data: any,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="form-group">
      <label htmlFor={field}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <input
        id={field}
        type={type}
        value={data[field]}
        onChange={(e) => handleInputChange(setter, data, field, e.target.value)}
        placeholder={placeholder}
        className={errors[field] ? 'input-error' : ''}
        disabled={loading}
      />
      {errors[field] && <span className="error-text">{errors[field]}</span>}
    </div>
  );

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-brand">
            <span className="brand-icon">&#x1F3E6;</span>
            <span className="brand-name">PrimeBank</span>
          </div>
          <h1>Create Account</h1>
          <p>Join us and experience modern banking</p>
        </div>

        <div className="role-selector">
          <span className="role-label">Sign up as:</span>
          <div className="role-options">
            <button
              type="button"
              className={`role-option ${role === 'customer' ? 'active' : ''}`}
              onClick={() => { setRole('customer'); setErrors({}); setSuccess(''); }}
            >
              <span className="role-icon">&#x1F464;</span>
              <span className="role-text">
                <strong>Customer</strong>
                <small>Personal banking</small>
              </span>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'employee' ? 'active' : ''}`}
              onClick={() => { setRole('employee'); setErrors({}); setSuccess(''); }}
            >
              <span className="role-icon">&#x1F468;&#x200D;&#x1F4BB;</span>
              <span className="role-text">
                <strong>Employee</strong>
                <small>Staff access</small>
              </span>
            </button>
          </div>
        </div>

        {success && (
          <div className="success-message">
            <span>&#x2714;</span> {success}
          </div>
        )}

        {errors.submit && (
          <div className="error-banner">
            <span>&#x26A0;</span> {errors.submit}
          </div>
        )}

        {role === 'customer' ? (
          <form onSubmit={handleCustomerSubmit} className="signup-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                {renderInput('National ID', 'nationalId', 'text', 'Enter your National ID', true, customerData, setCustomerData)}
                {renderInput('First Name', 'firstName', 'text', 'Enter your first name', true, customerData, setCustomerData)}
                {renderInput('Last Name', 'lastName', 'text', 'Enter your last name', true, customerData, setCustomerData)}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="gender">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    id="gender"
                    value={customerData.gender}
                    onChange={(e) => setCustomerData({ ...customerData, gender: e.target.value })}
                    disabled={loading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dob">
                    Date of Birth <span className="required">*</span>
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={customerData.dateOfBirth}
                    onChange={(e) => handleInputChange(setCustomerData, customerData, 'dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'input-error' : ''}
                    disabled={loading}
                  />
                  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Address</h3>
              <div className="form-grid">
                {renderInput('Street', 'street', 'text', 'Street address', false, customerData, setCustomerData)}
                {renderInput('Area', 'area', 'text', 'Area', false, customerData, setCustomerData)}
                {renderInput('State', 'state', 'text', 'State', false, customerData, setCustomerData)}
              </div>
            </div>

            <div className="form-section">
              <h3>Security</h3>
              <div className="form-grid">
                {renderInput('Password', 'password', 'password', 'Create a password', true, customerData, setCustomerData)}
                {renderInput('Confirm Password', 'confirmPassword', 'password', 'Confirm your password', true, customerData, setCustomerData)}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Account...
                </>
              ) : (
                'Create Customer Account'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmployeeSubmit} className="signup-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                {renderInput('First Name', 'firstName', 'text', 'Enter your first name', true, employeeData, setEmployeeData)}
                {renderInput('Last Name', 'lastName', 'text', 'Enter your last name', true, employeeData, setEmployeeData)}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="emp-gender">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    id="emp-gender"
                    value={employeeData.gender}
                    onChange={(e) => setEmployeeData({ ...employeeData, gender: e.target.value })}
                    disabled={loading}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {renderInput('Email', 'email', 'email', 'Enter your work email', true, employeeData, setEmployeeData)}
              </div>
            </div>

            <div className="form-section">
              <h3>Department</h3>
              <div className="form-group">
                <label htmlFor="department">
                  Select Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  value={employeeData.departmentId}
                  onChange={(e) => setEmployeeData({ ...employeeData, departmentId: parseInt(e.target.value) })}
                  disabled={loading}
                >
                  <option value={1}>HR Department</option>
                  <option value={2}>IT Department</option>
                  <option value={3}>Operations</option>
                  <option value={4}>Customer Service</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Security</h3>
              <div className="form-grid">
                {renderInput('Password', 'password', 'password', 'Create a password', true, employeeData, setEmployeeData)}
                {renderInput('Confirm Password', 'confirmPassword', 'password', 'Confirm your password', true, employeeData, setEmployeeData)}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Account...
                </>
              ) : (
                'Create Employee Account'
              )}
            </button>
          </form>
        )}

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login/customer">Sign in</Link></p>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%);
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .signup-container {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 580px;
          padding: 2.5rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signup-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .brand-icon {
          font-size: 2rem;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e3a5f;
        }

        .signup-header h1 {
          font-size: 1.75rem;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .signup-header p {
          color: #718096;
          font-size: 0.95rem;
        }

        .role-selector {
          margin-bottom: 1.5rem;
        }

        .role-label {
          display: block;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .role-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .role-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f7fafc;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .role-option:hover {
          border-color: #cbd5e0;
          background: #edf2f7;
        }

        .role-option.active {
          border-color: #1e3a5f;
          background: #ebf8ff;
        }

        .role-option .role-icon {
          font-size: 1.5rem;
        }

        .role-option .role-text {
          display: flex;
          flex-direction: column;
        }

        .role-option .role-text strong {
          color: #2d3748;
          font-size: 0.95rem;
        }

        .role-option .role-text small {
          color: #718096;
          font-size: 0.75rem;
        }

        .success-message {
          background: #c6f6d5;
          color: #22543d;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .error-banner {
          background: #fed7d7;
          color: #822727;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section h3 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e3a5f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 480px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-group label {
          font-weight: 500;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .required {
          color: #e53e3e;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #fff;
        }

        .form-group input::placeholder {
          color: #a0aec0;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1e3a5f;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);
        }

        .form-group input.input-error,
        .form-group select.input-error {
          border-color: #e53e3e;
        }

        .form-group input.input-error:focus {
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.15);
        }

        .error-text {
          color: #e53e3e;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .btn-submit {
          width: 100%;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .signup-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .signup-footer p {
          color: #718096;
          font-size: 0.9rem;
        }

        .signup-footer a {
          color: #1e3a5f;
          font-weight: 600;
          text-decoration: none;
        }

        .signup-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-container {
            padding: 1.5rem;
          }

          .role-options {
            grid-template-columns: 1fr;
          }

          .signup-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SignUp;