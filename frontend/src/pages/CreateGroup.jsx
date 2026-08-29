import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    privacy: 'public',
    image: '',
    settings: {
      hiddenFromHostelAdmin: false,
      requireApproval: false,
      onlyAdminsCanPost: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['general', 'study', 'sports', 'gaming', 'music', 'tech', 'other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/groups', formData);

      alert('Group created successfully!');
      navigate(`/groups/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="create-group-container">
      <div className="create-group-card">
        <h1 className="create-group-title">Create New Group</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., CS Students Study Group"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this group..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Privacy *</label>
              <select
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Group Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" className="preview-img" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, image: ''}))}
                  className="remove-image-btn"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="advanced-section">
            <h3 className="advanced-section-title">Advanced Settings</h3>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hiddenFromHostelAdmin"
                  checked={formData.settings.hiddenFromHostelAdmin}
                  onChange={handleSettingChange}
                  className="checkbox-input"
                />
                <span>Hide from admin view</span>
              </label>
              <p className="checkbox-hint">
                Group will not be visible in admin dashboard
              </p>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="requireApproval"
                  checked={formData.settings.requireApproval}
                  onChange={handleSettingChange}
                  className="checkbox-input"
                />
                <span>Require admin approval for new members</span>
              </label>
              <p className="checkbox-hint">
                New members must be approved before joining
              </p>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="onlyAdminsCanPost"
                  checked={formData.settings.onlyAdminsCanPost}
                  onChange={handleSettingChange}
                  className="checkbox-input"
                />
                <span>Only admins can post messages</span>
              </label>
              <p className="checkbox-hint">
                Regular members can only read messages
              </p>
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="pin-btn"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
