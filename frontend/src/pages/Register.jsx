// pages/Register.js - STUDENTS ONLY (Admin/Warden have fixed credentials)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setToken, API_BASE_URL } from '../api/client';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roomNumber: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    console.log('🔄 Starting registration...');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.roomNumber) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      // The server ignores any role sent here and always creates a student.

      const response = await api.post('/api/auth/register', userData);

      if (response.data.data.token) {
        setToken(response.data.data.token);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      
      if (err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else if (err.request) {
        setError(`Cannot connect to the server at ${API_BASE_URL}. Make sure the backend is running.`);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Student Registration</h2>
        <p className="subtitle">Register to submit and track complaints</p>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            ✅ Registration successful! Redirecting to login...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Room Number *</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              placeholder="Enter your room number"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" disabled={loading || success} className="btn-primary">
            {loading ? 'Registering...' : success ? 'Success! ✅' : 'Register'}
          </button>
        </form>

        <div className="admin-info-box">
          <p><strong>👨‍💼 Admin/Warden?</strong></p>
          <p>Use your credentials to login directly. No registration needed.</p>
        </div>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;