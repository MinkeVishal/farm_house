import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/axiosInstance';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box-2col">
        <div className="auth-left">
          <div className="auth-info">
            <h2>Join Our Community</h2>
            <p>Create an account to start booking your perfect farm house getaway</p>
            <div className="auth-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <p>Access exclusive farm houses</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <p>Easy booking management</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <p>Secure payments & reviews</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <p>24/7 customer support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h1>Register</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-columns">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-columns">
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <div className="form-group">
                  <label>Role:</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="OWNER">Farm Owner</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="auth-link">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
