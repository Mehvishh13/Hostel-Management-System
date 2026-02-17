import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/Marketplace.css';

const MarketplaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItem(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/rentals/${id}/interest`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowContactModal(true);
      fetchItemDetails();
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  const nextImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (loading) {
    return <div className="marketplace-container">Loading...</div>;
  }

  if (!item) {
    return <div className="marketplace-container">Item not found</div>;
  }

  return (
    <div className="marketplace-container">
      <button onClick={() => navigate('/marketplace')} style={styles.backBtn}>
        ← Back to Marketplace
      </button>

      <div style={styles.detailContainer}>
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            {item.images && item.images.length > 0 ? (
              <>
                <img 
                  src={item.images[currentImageIndex]} 
                  alt={item.title}
                  style={styles.image}
                />
                {item.images.length > 1 && (
                  <>
                    <button onClick={prevImage} style={{...styles.navBtn, left: '10px'}}>❮</button>
                    <button onClick={nextImage} style={{...styles.navBtn, right: '10px'}}>❯</button>
                  </>
                )}
              </>
            ) : (
              <div className="no-image">📦</div>
            )}
          </div>
          
          {item.images && item.images.length > 1 && (
            <div style={styles.thumbnails}>
              {item.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: currentImageIndex === index ? '3px solid #667eea' : '2px solid #ddd'
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.infoSection}>
          <div style={styles.header}>
            <h1 style={styles.title}>{item.title}</h1>
            <span className="item-condition" style={{fontSize: '14px', textTransform: 'capitalize'}}>
              {item.condition}
            </span>
          </div>

          <div style={styles.priceSection}>
            <span style={styles.price}>₹{item.pricePerDay}</span>
            <span style={styles.period}>/day</span>
          </div>

          <div style={styles.category}>
            📂 Category: <strong>{item.category}</strong>
          </div>

          <div style={styles.description}>
            <h3>Description</h3>
            <p>{item.description}</p>
          </div>

          <div style={styles.availability}>
            <strong>Status:</strong> {item.available ? '✅ Available' : '❌ Not Available'}
          </div>

          <div style={styles.views}>
            👁️ {item.views || 0} views
          </div>

          <div style={styles.ownerSection}>
            <h3>Owner Information</h3>
            <p><strong>Name:</strong> {item.ownerName || item.ownerId?.name}</p>
            <p><strong>Room:</strong> {item.ownerRoom || item.ownerId?.roomNumber}</p>
            <p><strong>Phone:</strong> {showContactModal ? (item.ownerPhone || item.ownerId?.phoneNumber) : '***-***-****'}</p>
          </div>

          {item.available && (
            <button onClick={handleInterest} style={styles.interestBtn}>
              💬 I'm Interested
            </button>
          )}
        </div>
      </div>

      {showContactModal && (
        <div style={styles.modal} onClick={() => setShowContactModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Contact Owner</h2>
            <p><strong>Name:</strong> {item.ownerName || item.ownerId?.name}</p>
            <p><strong>Phone:</strong> {item.ownerPhone || item.ownerId?.phoneNumber}</p>
            <p><strong>Room:</strong> {item.ownerRoom || item.ownerId?.roomNumber}</p>
            <button onClick={() => setShowContactModal(false)} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  backBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: '600'
  },
  detailContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  mainImage: {
    width: '100%',
    height: '400px',
    background: '#f5f5f5',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '20px',
    borderRadius: '50%'
  },
  thumbnails: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto'
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '28px',
    margin: 0,
    color: '#2c3e50'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px'
  },
  price: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#667eea'
  },
  period: {
    fontSize: '18px',
    color: '#95a5a6'
  },
  category: {
    fontSize: '16px',
    color: '#666'
  },
  description: {
    lineHeight: '1.6'
  },
  availability: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '16px'
  },
  views: {
    fontSize: '14px',
    color: '#95a5a6'
  },
  ownerSection: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  interestBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%'
  },
  closeBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%'
  }
};

export default MarketplaceDetail;