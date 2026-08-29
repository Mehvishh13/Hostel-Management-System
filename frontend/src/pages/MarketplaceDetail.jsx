import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
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
      const response = await api.get(`/api/rentals/${id}`);
      setItem(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching item:', error);
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    try {
      await api.post(`/api/rentals/${id}/interest`, {});
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
        ← Back to marketplace
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
              <div className="no-image">No photo</div>
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
                    border: currentImageIndex === index ? '3px solid var(--pin-red)' : '2px solid var(--paper-line)'
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
            <span style={{fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--twine)', fontWeight: 600}}>
              {item.condition}
            </span>
          </div>

          <span style={{...styles.listingTypeBadge, ...(item.listingType === 'sale' ? styles.listingTypeBadgeSale : styles.listingTypeBadgeRent)}}>
            {item.listingType === 'sale' ? 'For sale' : 'For rent'}
          </span>

          <div style={styles.priceSection}>
            <span style={styles.price}>₹{item.price}</span>
            {item.listingType !== 'sale' && <span style={styles.period}>/day</span>}
          </div>

          <div style={styles.category}>
            Category <strong style={{color: 'var(--ink)'}}>{item.category}</strong>
          </div>

          <div style={styles.description}>
            <h3 style={styles.sectionHeading}>Description</h3>
            <p>{item.description}</p>
          </div>

          <div style={styles.availability}>
            <strong>Status:</strong> {item.available ? 'Available' : 'Not available'}
          </div>

          <div style={styles.views}>
            {item.views || 0} views
          </div>

          <div style={styles.ownerSection}>
            <h3 style={styles.sectionHeading}>Owner information</h3>
            <p><strong>Name:</strong> {item.ownerName || item.ownerId?.name}</p>
            <p><strong>Room:</strong> {item.ownerRoom || item.ownerId?.roomNumber}</p>
          </div>

          {item.available && (
            <button onClick={handleInterest} style={styles.interestBtn}>
              I'm interested
            </button>
          )}
        </div>
      </div>

      {showContactModal && (
        <div style={styles.modal} onClick={() => setShowContactModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.sectionHeading}>Interest sent</h2>
            <p>{item.ownerName || item.ownerId?.name} has been notified. Coordinate the rental in person or via the room number listed on this page.</p>
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
    padding: '10px 18px',
    background: 'transparent',
    color: 'var(--ink-dim)',
    border: '1.5px solid var(--paper-line)',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: '600',
    fontFamily: 'var(--font-body)',
    fontSize: '13px'
  },
  detailContainer: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    background: 'var(--paper)',
    padding: '30px',
    boxShadow: '0 10px 18px -6px rgba(20,12,4,0.4), 0 2px 0 rgba(255,255,255,0.4) inset'
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  mainImage: {
    width: '100%',
    height: '380px',
    background: 'var(--paper-raised)',
    overflow: 'hidden',
    position: 'relative',
    border: '1px dashed var(--paper-line)'
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
    background: 'rgba(20,12,4,0.55)',
    color: 'var(--paper)',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '18px',
    borderRadius: '50%'
  },
  thumbnails: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto'
  },
  thumbnail: {
    width: '76px',
    height: '76px',
    objectFit: 'cover',
    cursor: 'pointer'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    fontSize: '24px',
    margin: 0,
    color: 'var(--ink)'
  },
  sectionHeading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    fontSize: '15px',
    color: 'var(--ink)',
    margin: '0 0 8px'
  },
  listingTypeBadge: {
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '3px 9px',
    border: '1.5px solid'
  },
  listingTypeBadgeSale: {
    color: 'var(--twine)',
    borderColor: 'var(--twine)'
  },
  listingTypeBadgeRent: {
    color: 'var(--resolved-green)',
    borderColor: 'var(--resolved-green)'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    fontFamily: 'var(--font-mono)'
  },
  price: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--pin-red)'
  },
  period: {
    fontSize: '15px',
    color: 'var(--ink-faint)'
  },
  category: {
    fontSize: '14px',
    color: 'var(--ink-dim)'
  },
  description: {
    lineHeight: '1.6',
    color: 'var(--ink-dim)',
    fontSize: '14.5px'
  },
  availability: {
    padding: '14px 16px',
    background: 'var(--paper-raised)',
    border: '1px solid var(--paper-line)',
    fontSize: '14px',
    color: 'var(--ink)'
  },
  views: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12.5px',
    color: 'var(--ink-faint)'
  },
  ownerSection: {
    padding: '18px',
    background: 'var(--paper-raised)',
    border: '1px solid var(--paper-line)',
    fontSize: '14px',
    color: 'var(--ink-dim)'
  },
  interestBtn: {
    padding: '14px 28px',
    background: 'var(--pin-red)',
    color: 'var(--paper)',
    border: 'none',
    boxShadow: '0 4px 0 var(--pin-red-deep), 0 6px 10px rgba(0,0,0,0.25)',
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '6px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(20,12,4,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    position: 'relative',
    background: 'var(--paper)',
    padding: '28px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 10px 18px -6px rgba(20,12,4,0.4), 0 2px 0 rgba(255,255,255,0.4) inset',
    color: 'var(--ink)'
  },
  closeBtn: {
    marginTop: '18px',
    padding: '10px 20px',
    background: 'transparent',
    color: 'var(--ink-dim)',
    border: '1.5px solid var(--paper-line)',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontWeight: 600
  }
};

export default MarketplaceDetail;