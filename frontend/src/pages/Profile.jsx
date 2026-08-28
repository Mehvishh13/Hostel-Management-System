import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import '../pages/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      
      // Fetch user info
      const userResponse = await api.get('/api/auth/me');
      const currentUser = userResponse.data.data;
      setUser(currentUser);

      // Fetch complaints
      try {
        const complaintsResponse = await api.get('/api/complaints');
        // Filter user's complaints
        const userComplaints = complaintsResponse.data.data?.filter(
          c => c.student?._id === currentUser._id || c.student === currentUser._id
        ) || [];
        setComplaints(userComplaints);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setComplaints([]);
      }

      // Fetch rental items
      try {
        const itemsResponse = await api.get('/api/rentals');
        // Filter user's items
        const userItems = itemsResponse.data.data?.filter(
          i => i.ownerId?._id === currentUser._id || i.ownerId === currentUser._id
        ) || [];
        setItems(userItems);
      } catch (err) {
        console.error('Error fetching items:', err);
        setItems([]);
      }

      // Fetch groups
      try {
        const groupsResponse = await api.get('/api/groups');
        // Filter user's groups
        const userGroups = groupsResponse.data.data?.filter(
          g => g.members?.some(m => (m._id || m) === currentUser._id)
        ) || [];
        setGroups(userGroups);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setGroups([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!user) {
    return <div className="profile-container">User not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1>{user.name}</h1>
          <div className="profile-meta">
            <span>📧 {user.email}</span>
            <span>📱 {user.phoneNumber || user.phone}</span>
            {user.role === 'student' && <span>🚪 Room {user.roomNumber}</span>}
            <span>👤 {user.role}</span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-number">{complaints.length}</div>
          <div className="stat-label">Complaints</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{items.length}</div>
          <div className="stat-label">Items Listed</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{groups.length}</div>
          <div className="stat-label">Groups Joined</div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          My Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          My Complaints ({complaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          My Items ({items.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          My Groups ({groups.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && (
          <div style={styles.infoSection}>
            <h2>Personal Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <strong>Name:</strong> {user.name}
              </div>
              <div style={styles.infoItem}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={styles.infoItem}>
                <strong>Phone:</strong> {user.phoneNumber || user.phone}
              </div>
              <div style={styles.infoItem}>
                <strong>Role:</strong> {user.role}
              </div>
              {user.role === 'student' && (
                <div style={styles.infoItem}>
                  <strong>Room Number:</strong> {user.roomNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Complaints</h2>
              <Link to="/complaints" style={styles.actionBtn}>+ New Complaint</Link>
            </div>
            {complaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No complaints yet</p>
                <Link to="/complaints" style={styles.primaryBtn}>File a Complaint</Link>
              </div>
            ) : (
              <div style={styles.list}>
                {complaints.map(complaint => (
                  <div key={complaint._id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3>{complaint.title}</h3>
                      <span style={getStatusStyle(complaint.status)}>{complaint.status}</span>
                    </div>
                    <p style={styles.cardDescription}>{complaint.description}</p>
                    <div style={styles.cardFooter}>
                      <span>📂 {complaint.category}</span>
                      <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Listed Items</h2>
              <Link to="/marketplace/add" style={styles.actionBtn}>+ Add Item</Link>
            </div>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>No items listed yet</p>
                <Link to="/marketplace/add" style={styles.primaryBtn}>List an Item</Link>
              </div>
            ) : (
              <div style={styles.list}>
                {items.map(item => (
                  <Link 
                    key={item._id} 
                    to={`/marketplace/${item._id}`}
                    style={styles.card}
                  >
                    <div style={styles.itemCard}>
                      <div style={styles.itemImage}>
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title} style={styles.img} />
                        ) : (
                          <div style={styles.noImage}>📦</div>
                        )}
                      </div>
                      <div style={styles.itemInfo}>
                        <h3>{item.title}</h3>
                        <p style={styles.itemPrice}>₹{item.pricePerDay}/day</p>
                        <div style={styles.itemMeta}>
                          <span>{item.available ? '✅ Available' : '❌ Unavailable'}</span>
                          <span>👁️ {item.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Groups</h2>
              <Link to="/groups/create" style={styles.actionBtn}>+ Create Group</Link>
            </div>
            {groups.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>No groups joined yet</p>
                <Link to="/groups" style={styles.primaryBtn}>Browse Groups</Link>
              </div>
            ) : (
              <div style={styles.list}>
                {groups.map(group => (
                  <Link 
                    key={group._id} 
                    to={`/groups/${group._id}`}
                    style={styles.card}
                  >
                    <div style={styles.cardHeader}>
                      <h3>{group.name}</h3>
                      <span style={styles.badge}>{group.category}</span>
                    </div>
                    <p style={styles.cardDescription}>{group.description}</p>
                    <div style={styles.cardFooter}>
                      <span>👥 {group.members?.length || 0} members</span>
                      <span>{group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status) => ({
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  background: status === 'resolved' ? '#d4edda' : status === 'in-progress' ? '#fff3cd' : '#f8d7da',
  color: status === 'resolved' ? '#155724' : status === 'in-progress' ? '#856404' : '#721c24'
});

const styles = {
  infoSection: {
    padding: '20px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  infoItem: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '16px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  actionBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600'
  },
  primaryBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'inline-block'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  card: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.3s',
    cursor: 'pointer'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  cardDescription: {
    color: '#7f8c8d',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#95a5a6'
  },
  badge: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  itemCard: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  itemImage: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0f0',
    fontSize: '48px'
  },
  itemInfo: {
    flex: 1
  },
  itemPrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#667eea',
    margin: '5px 0'
  },
  itemMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '14px',
    color: '#7f8c8d'
  }
};

export default Profile;