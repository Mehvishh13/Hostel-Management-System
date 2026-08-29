import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
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
      const response = await api.get('/api/groups');
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
      const response = await api.post(`/api/groups/${groupId}/join`, {});

      if (response.data.data.pending) {
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
      await api.post(`/api/groups/${groupId}/cancel-request`, {});

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
      return <span className="stamp stamp--member">Member</span>;
    }

    if (userStatus.isPending) {
      return (
        <div className="pending-container">
          <span className="stamp stamp--pending">Pending</span>
          <button
            onClick={(e) => handleCancelRequest(group._id, e)}
            className="cancel-btn"
          >
            Cancel request
          </button>
        </div>
      );
    }

    if (userStatus.canJoin) {
      return (
        <button
          onClick={(e) => handleJoinGroup(group._id, e)}
          className="join-btn"
        >
          {group.settings?.requireApproval ? 'Request to join' : 'Join group'}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="groups-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading groups…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Hostel Groups</h1>
        <Link to="/groups/create" className="pin-btn">
          + Create group
        </Link>
      </div>

      {/* Filter by membership */}
      <div className="groups-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All groups ({allGroups.length})
        </button>
        <button
          className={`filter-btn ${filter === 'my' ? 'active' : ''}`}
          onClick={() => setFilter('my')}
        >
          My groups ({getMyGroups().length})
        </button>
      </div>

      {/* Filter by category */}
      <div className="groups-filter">
        <button
          className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All categories
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
        <div className="no-items">
          <h2>No groups found</h2>
          <p className="empty-text">
            {filter === 'my'
              ? "You haven't joined any groups yet. Browse available groups below!"
              : 'Be the first to create a group for your hostel community!'}
          </p>
          {filter === 'my' && (
            <button onClick={() => setFilter('all')} className="pin-btn">
              Browse all groups
            </button>
          )}
          {filter === 'all' && (
            <Link to="/groups/create" className="pin-btn">
              Create first group
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
                  <span className="group-monogram">{group.name?.charAt(0)?.toUpperCase()}</span>
                )}
                <div className="privacy-badge">
                  {group.privacy === 'private' ? 'Private' : 'Public'}
                </div>
              </div>

              <div className="group-content">
                <h2 className="group-name">{group.name}</h2>
                <p className="group-description">{group.description}</p>

                <div className="group-footer">
                  <span className="group-members">
                    <b>{group.memberCount || group.members?.length || 0}</b> members
                  </span>
                  <span className={`group-category ${group.category === 'events' ? 'group-category--events' : ''}`}>
                    {group.category?.charAt(0).toUpperCase() + group.category?.slice(1)}
                  </span>
                </div>

                {/* Show admin/creator badge if applicable */}
                {group.userStatus?.isCreator && (
                  <div className="role-badge">
                    <span className="stamp stamp--creator">Creator</span>
                  </div>
                )}
                {group.userStatus?.isGroupAdmin && !group.userStatus?.isCreator && (
                  <div className="role-badge">
                    <span className="stamp stamp--admin">Admin</span>
                  </div>
                )}

                {/* Show approval required message */}
                {group.settings?.requireApproval && !group.userStatus?.isMember && (
                  <p className="approval-note">Requires admin approval</p>
                )}

                <div className="actions">
                  <Link
                    to={`/groups/${group._id}`}
                    className="view-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View details
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

export default Groups;
