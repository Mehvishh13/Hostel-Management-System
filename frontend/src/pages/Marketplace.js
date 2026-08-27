// pages/Marketplace.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './Marketplace.css';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const res = await api.get('/api/rentals', { params });
      const itemsData = res.data.data || res.data;
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Items', icon: '🏪' },
    { value: 'books', label: 'Books', icon: '📚' },
    { value: 'electronics', label: 'Electronics', icon: '💻' },
    { value: 'furniture', label: 'Furniture', icon: '🪑' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  if (loading) {
    return <div className="loading">Loading marketplace...</div>;
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <div>
          <h1>🛒 Rental Marketplace</h1>
          <p className="subtitle">Rent items from fellow students</p>
        </div>
        <Link to="/marketplace/add" className="btn-primary">
          + List Item
        </Link>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`category-btn ${filter === cat.value ? 'active' : ''}`}
            onClick={() => setFilter(cat.value)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {items.length === 0 ? (
          <div className="no-items">
            <p>No items available in this category</p>
            <Link to="/marketplace/add" className="btn-secondary">
              Be the first to list an item!
            </Link>
          </div>
        ) : (
          items.map(item => (
            <Link 
              to={`/marketplace/${item._id}`} 
              key={item._id}
              className="item-card"
            >
              <div className="item-image">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} />
                ) : (
                  <div className="no-image">📦</div>
                )}
                {!item.available && (
                  <div className="unavailable-badge">Not Available</div>
                )}
              </div>
              
              <div className="item-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  {item.description.substring(0, 80)}
                  {item.description.length > 80 ? '...' : ''}
                </p>
                
                <div className="item-footer">
                  <div className="item-price">
                    <span className="price-amount">₹{item.pricePerDay}</span>
                    <span className="price-period">/day</span>
                  </div>
                  
                  <div className="item-meta">
                    <span className="item-condition">{item.condition}</span>
                    <span className="item-views">👁 {item.views}</span>
                  </div>
                </div>

                <div className="item-owner">
                  <span>By: {item.ownerName}</span>
                  <span className="owner-room">Room {item.ownerRoom}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Marketplace;