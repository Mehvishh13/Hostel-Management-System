// pages/Marketplace.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './Marketplace.css';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [listingType, setListingType] = useState('all');

  useEffect(() => {
    fetchItems();
  }, [filter, listingType]);

  const fetchItems = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;
      if (listingType !== 'all') params.listingType = listingType;
      const res = await api.get('/api/rentals', { params });
      const itemsData = res.data.data;
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All items' },
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'sports', label: 'Sports' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return <div className="loading">Loading marketplace...</div>;
  }

  return (
    <div className="marketplace-container">
      <p className="marketplace-container__eyebrow">Hostel Board · Notice Board</p>

      <div className="marketplace-header">
        <div>
          <h1>Marketplace</h1>
          <p className="subtitle">Rent or buy items from fellow students</p>
        </div>
        <Link to="/marketplace/add" className="pin-btn">
          + List item
        </Link>
      </div>

      {/* Listing Type Filter */}
      <div className="category-filter">
        {[
          { value: 'all', label: 'All listings' },
          { value: 'rent', label: 'For rent' },
          { value: 'sale', label: 'For sale' }
        ].map(opt => (
          <button
            key={opt.value}
            className={`category-btn ${listingType === opt.value ? 'active' : ''}`}
            onClick={() => setListingType(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`category-btn ${filter === cat.value ? 'active' : ''}`}
            onClick={() => setFilter(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {items.length === 0 ? (
          <div className="no-items">
            <p>No items available in this category</p>
            <Link to="/marketplace/add" className="btn btn-secondary">
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
                  <div className="no-image">No photo</div>
                )}
                {!item.available && (
                  <div className="unavailable-badge">
                    {item.listingType === 'sale' ? 'Sold' : 'Not available'}
                  </div>
                )}
                <span className={`listing-type-badge listing-type-badge--${item.listingType}`}>
                  {item.listingType === 'sale' ? 'For sale' : 'For rent'}
                </span>
              </div>

              <div className="item-content">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">
                  {item.description.substring(0, 80)}
                  {item.description.length > 80 ? '...' : ''}
                </p>

                <div className="item-footer">
                  <div className="item-price">
                    <span className="price-amount">₹{item.price}</span>
                    {item.listingType !== 'sale' && <span className="price-period">/day</span>}
                  </div>

                  <div className="item-meta">
                    <span className="item-condition">{item.condition}</span>
                    <span className="sep">·</span>
                    <span className="item-views">{item.views} views</span>
                  </div>
                </div>

                <div className="item-owner">
                  <span>By {item.ownerName}</span>
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
