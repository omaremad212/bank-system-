import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface FormErrors {
  [key: string]: string;
}

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'National ID is required';
    } else if (formData.nationalId.length < 10) {
      newErrors.nationalId = 'National ID must be at least 10 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.signup.customer({
        nationalId: formData.nationalId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        street: formData.street,
        area: formData.area,
        state: formData.state,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login/customer'), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const renderInput = (
    label: string,
    field: string,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false
  ) => (
    <div className="form-group">
      <label htmlFor={field}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <input
        id={field}
        type={type}
        value={formData[field as keyof typeof formData]}
        onChange={(e) => handleInputChange(field, e.target.value)}
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

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              {renderInput('National ID', 'nationalId', 'text', 'Enter your National ID', true)}
              {renderInput('First Name', 'firstName', 'text', 'Enter your first name', true)}
              {renderInput('Last Name', 'lastName', 'text', 'Enter your last name', true)}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
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
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
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
              {renderInput('Street', 'street', 'text', 'Street address')}
              {renderInput('Area', 'area', 'text', 'Area')}
              {renderInput('State', 'state', 'text', 'State')}
            </div>
          </div>

          <div className="form-section">
            <h3>Security</h3>
            <div className="form-grid">
              {renderInput('Password', 'password', 'password', 'Create a password', true)}
              {renderInput('Confirm Password', 'confirmPassword', 'password', 'Confirm your password', true)}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

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
          max-width: 520px;
          padding: 2rem;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 1.5rem;
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
          gap: 1.25rem;
        }

        .form-section h3 {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1e3a5f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
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

        .form-group input.input-error {
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
          padding-top: 1rem;
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
        }
      `}</style>
    </div>
  );
};

export default SignUp;