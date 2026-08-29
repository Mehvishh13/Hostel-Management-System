import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './AddRentalItem.css';

const AddRentalItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    listingType: 'rent',
    price: '',
    condition: 'good',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Books', 'Electronics', 'Sports', 'Furniture', 'Clothing', 'Other'];
  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Phone camera photos routinely run 3-8MB; downscale to a max dimension
  // and re-encode as JPEG so a handful of images stay well under the API's
  // request body limit.
  const MAX_DIMENSION = 1280;
  const JPEG_QUALITY = 0.72;

  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    try {
      const compressed = await Promise.all(files.map(compressImage));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...compressed].slice(0, 5)
      }));
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process one of the images');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/rentals', formData);

      alert('Item added successfully!');
      navigate('/marketplace');
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error.response?.data?.message || 'Failed to add item');
      setLoading(false);
    }
  };

  return (
    <div className="add-rental-item-container">
      <div className="add-rental-item-card">
        <h1 className="add-rental-item-title">List an item</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-rental-item-form">
          <div className="form-group">
            <label>Listing type *</label>
            <div className="listing-type-toggle">
              <button
                type="button"
                className={`listing-type-btn ${formData.listingType === 'rent' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'rent' }))}
              >
                For rent
              </button>
              <button
                type="button"
                className={`listing-type-btn ${formData.listingType === 'sale' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, listingType: 'sale' }))}
              >
                For sale
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Python Programming Textbook"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item in detail..."
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
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{formData.listingType === 'sale' ? 'Price (₹) *' : 'Price per day (₹) *'}</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="10"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              {conditions.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Images (Max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="file-input"
              disabled={formData.images.length >= 5}
            />
            <p className="hint">You can upload up to 5 images</p>
          </div>

          {formData.images.length > 0 && (
            <div className="image-preview-grid">
              {formData.images.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <img src={img} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="image-remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-button-group">
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRentalItem;
