import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/groups', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Group created successfully!');
      navigate(`/groups/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>Create New Group</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Group Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., CS Students Study Group"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this group..."
              style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Privacy *</label>
              <select
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Group Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={styles.fileInput}
            />
            {formData.image && (
              <div style={styles.imagePreview}>
                <img src={formData.image} alt="Preview" style={styles.previewImg} />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, image: ''}))}
                  style={styles.removeBtn}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div style={styles.advancedSection}>
            <h3 style={styles.sectionTitle}>Advanced Settings</h3>
            
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="hiddenFromHostelAdmin"
                  checked={formData.settings.hiddenFromHostelAdmin}
                  onChange={handleSettingChange}
                  style={styles.checkbox}
                />
                <span>Hide from admin view</span>
              </label>
              <p style={styles.hint}>
                Group will not be visible in admin dashboard
              </p>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="requireApproval"
                  checked={formData.settings.requireApproval}
                  onChange={handleSettingChange}
                  style={styles.checkbox}
                />
                <span>Require admin approval for new members</span>
              </label>
              <p style={styles.hint}>
                New members must be approved before joining
              </p>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="onlyAdminsCanPost"
                  checked={formData.settings.onlyAdminsCanPost}
                  onChange={handleSettingChange}
                  style={styles.checkbox}
                />
                <span>Only admins can post messages</span>
              </label>
              <p style={styles.hint}>
                Regular members can only read messages
              </p>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/groups')}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '32px',
    color: '#2c3e50',
    marginBottom: '30px',
    textAlign: 'center'
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  fileInput: {
    padding: '10px',
    border: '2px dashed #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  imagePreview: {
    marginTop: '15px',
    textAlign: 'center'
  },
  previewImg: {
    maxWidth: '100%',
    maxHeight: '200px',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  removeBtn: {
    padding: '8px 16px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  advancedSection: {
    marginTop: '20px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#2c3e50',
    marginBottom: '15px'
  },
  checkboxGroup: {
    marginBottom: '15px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    color: '#2c3e50',
    cursor: 'pointer',
    fontWeight: '500'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  hint: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginLeft: '28px',
    marginTop: '5px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '15px',
    background: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 1,
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default CreateGroup;