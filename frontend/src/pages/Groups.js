import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../pages/Groups.css';

const Groups = () => {
  const [allGroups, setAllGroups] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const categories = ['general', 'study', 'sports', 'events', 'entertainment', 'food'];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllGroups(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.pending) {
        alert('Join request sent! Waiting for admin approval.');
      } else {
        alert('Successfully joined the group!');
      }
      
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleCancelRequest = async (groupId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/groups/${groupId}/cancel-request`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Join request cancelled');
      fetchGroups();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  const getMyGroups = () => {
    if (!user) return [];
    return allGroups.filter(g => g.userStatus?.isMember);
  };

  const filteredGroups = () => {
    let filtered = filter === 'my' ? getMyGroups() : allGroups;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }
    
    return filtered;
  };

  const getGroupStatusButton = (group) => {
    const userStatus = group.userStatus || {};

    if (userStatus.isMember) {
      return (
        <span style={styles.memberBadge}>
          ✓ Member
        </span>
      );
    }

    if (userStatus.isPending) {
      return (
        <div style={styles.pendingContainer}>
          <span style={styles.pendingBadge}>⏳ Pending</span>
          <button
            onClick={(e) => handleCancelRequest(group._id, e)}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      );
    }

    if (userStatus.canJoin) {
      return (
        <button
          onClick={(e) => handleJoinGroup(group._id, e)}
          style={styles.joinBtn}
        >
          {group.settings?.requireApproval ? '🔔 Request to Join' : '➕ Join Group'}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="groups-container">
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>🏘️ Hostel Groups</h1>
        <Link to="/groups/create" style={styles.createBtn}>
          + Create Group
        </Link>
      </div>

      {/* Filter by membership */}
      <div className="groups-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          🌍 All Groups ({allGroups.length})
        </button>
        <button
          className={`filter-btn ${filter === 'my' ? 'active' : ''}`}
          onClick={() => setFilter('my')}
        >
          👤 My Groups ({getMyGroups().length})
        </button>
      </div>

      {/* Filter by category */}
      <div className="groups-filter">
        <button
          className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          📂 All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {filteredGroups().length === 0 ? (
        <div style={styles.noItems}>
          <div style={styles.emptyIcon}>🏘️</div>
          <h2>No groups found</h2>
          <p style={styles.emptyText}>
            {filter === 'my' 
              ? "You haven't joined any groups yet. Browse available groups below!"
              : "Be the first to create a group for your hostel community!"}
          </p>
          {filter === 'my' && (
            <button
              onClick={() => setFilter('all')}
              style={styles.primaryBtn}
            >
              Browse All Groups
            </button>
          )}
          {filter === 'all' && (
            <Link to="/groups/create" style={styles.primaryBtn}>
              Create First Group
            </Link>
          )}
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups().map(group => (
            <div key={group._id} className="group-card">
              <div className="group-image">
                {group.image ? (
                  <img src={group.image} alt={group.name} />
                ) : (
                  <span style={styles.defaultIcon}>👥</span>
                )}
                <div className="privacy-badge">
                  {group.privacy === 'private' ? '🔒' : '🌐'}
                </div>
              </div>

              <div className="group-content">
                <h2 className="group-name">{group.name}</h2>
                <p className="group-description">{group.description}</p>

                <div className="group-footer">
                  <div className="group-members">
                    <span>👥</span>
                    <span>{group.memberCount || group.members?.length || 0} members</span>
                  </div>
                  <span className="group-category">
                    {group.category?.charAt(0).toUpperCase() + group.category?.slice(1)}
                  </span>
                </div>

                {/* Show admin/creator badge if applicable */}
                {group.userStatus?.isCreator && (
                  <div style={styles.roleBadge}>
                    <span style={{...styles.badge, background: '#f39c12'}}>
                      👑 Creator
                    </span>
                  </div>
                )}
                {group.userStatus?.isAdmin && !group.userStatus?.isCreator && (
                  <div style={styles.roleBadge}>
                    <span style={{...styles.badge, background: '#667eea'}}>
                      ⭐ Admin
                    </span>
                  </div>
                )}

                {/* Show approval required message */}
                {group.settings?.requireApproval && !group.userStatus?.isMember && (
                  <div style={styles.approvalNote}>
                    <span>🔔 Requires admin approval</span>
                  </div>
                )}

                <div style={styles.actions}>
                  <Link 
                    to={`/groups/${group._id}`} 
                    style={styles.viewBtn}
                    onClick={(e) => e.stopPropagation()}
                  >
                    👁️ View Details
                  </Link>
                  {getGroupStatusButton(group)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  createBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'inline-block',
    transition: 'all 0.3s ease'
  },
  primaryBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '10px',
    border: 'none',
    cursor: 'pointer'
  },
  defaultIcon: {
    fontSize: '64px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    alignItems: 'stretch'
  },
  viewBtn: {
    flex: 1,
    padding: '10px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  joinBtn: {
    flex: 1,
    padding: '10px',
    background: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px'
  },
  memberBadge: {
    flex: 1,
    padding: '10px',
    background: '#95a5a6',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pendingContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  pendingBadge: {
    padding: '8px',
    background: '#f39c12',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '13px'
  },
  cancelBtn: {
    padding: '6px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease'
  },
  noItems: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: '16px',
    marginBottom: '20px'
  },
  roleBadge: {
    marginTop: '10px'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600'
  },
  approvalNote: {
    marginTop: '10px',
    padding: '8px',
    background: '#fff3cd',
    color: '#856404',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  }
};

export default Groups;