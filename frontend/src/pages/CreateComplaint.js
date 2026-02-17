// pages/CreateComplaint.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateComplaint.css';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const categories = [
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'other', label: 'Other', icon: '📌' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#27ae60' },
    { value: 'medium', label: 'Medium', color: '#f39c12' },
    { value: 'high', label: 'High', color: '#e74c3c' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/complaints', formData);
      navigate('/complaints');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-complaint-container">
      <div className="create-complaint-card">
        <h1>Submit a New Complaint</h1>
        <p className="subtitle">Fill in the details below to report an issue</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
            />
            <small>{formData.title.length}/100 characters</small>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <div className="category-grid">
              {categories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={formData.category === cat.value}
                    onChange={handleChange}
                  />
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <div className="priority-options">
              {priorities.map(p => (
                <label 
                  key={p.value} 
                  className={`priority-option ${formData.priority === p.value ? 'selected' : ''}`}
                  style={{ 
                    borderColor: formData.priority === p.value ? p.color : '#ddd',
                    backgroundColor: formData.priority === p.value ? p.color + '20' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={formData.priority === p.value}
                    onChange={handleChange}
                  />
                  <span style={{ color: p.color }}>⬤</span>
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows="6"
              required
            />
            <small>{formData.description.length}/500 characters</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/complaints')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;