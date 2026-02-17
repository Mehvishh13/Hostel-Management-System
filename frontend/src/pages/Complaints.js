// pages/Complaints.js - WITH VOTING DISPLAY
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Complaints.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'date'
  const [error, setError] = useState('');
  const { isStudent, user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setError('');
      const res = await axios.get('http://localhost:5000/api/complaints');
      
      const complaintsData = res.data.data || res.data;
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError(error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      'in-progress': '#3498db',
      resolved: '#27ae60',
      rejected: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c'
    };
    return colors[priority] || '#95a5a6';
  };

  // Filter and sort complaints
  let filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    if (filter === 'my-complaints') {
      return complaint.studentId?._id === user._id || complaint.studentId === user._id;
    }
    return complaint.status === filter;
  });

  // Sort complaints
  if (sortBy === 'votes') {
    filteredComplaints = filteredComplaints.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  } else {
    filteredComplaints = filteredComplaints.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  if (loading) {
    return <div className="loading">Loading complaints...</div>;
  }

  if (error) {
    return (
      <div className="complaints-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchComplaints} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <div>
          <h1>All Complaints</h1>
          <p className="subtitle">View and support community complaints</p>
        </div>
        {isStudent && (
          <Link to="/complaints/new" className="btn-primary">
            + New Complaint
          </Link>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="filter-sort-section">
        <div className="filter-section">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({complaints.length})
          </button>
          {isStudent && (
            <button 
              className={filter === 'my-complaints' ? 'active' : ''} 
              onClick={() => setFilter('my-complaints')}
            >
              My Complaints
            </button>
          )}
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({complaints.filter(c => c.status === 'pending').length})
          </button>
          <button 
            className={filter === 'in-progress' ? 'active' : ''} 
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({complaints.filter(c => c.status === 'in-progress').length})
          </button>
          <button 
            className={filter === 'resolved' ? 'active' : ''} 
            onClick={() => setFilter('resolved')}
          >
            Resolved ({complaints.filter(c => c.status === 'resolved').length})
          </button>
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="votes">Most Voted</option>
            <option value="date">Most Recent</option>
          </select>
        </div>
      </div>

      <div className="complaints-list">
        {filteredComplaints.length === 0 ? (
          <div className="no-complaints">
            <p>No complaints found</p>
            {isStudent && filter === 'all' && (
              <Link to="/complaints/new" className="btn-primary" style={{ marginTop: '20px' }}>
                Create Your First Complaint
              </Link>
            )}
          </div>
        ) : (
          filteredComplaints.map(complaint => (
            <Link 
              to={`/complaints/${complaint._id}`} 
              key={complaint._id} 
              className="complaint-card"
            >
              <div className="complaint-card-header">
                <div className="complaint-votes">
                  <div className="vote-icon">👍</div>
                  <div className="vote-info">
                    <strong>{complaint.voteCount || 0}</strong>
                    <span>votes</span>
                  </div>
                </div>
                
                <div className="complaint-main-content">
                  <div className="complaint-header-row">
                    <h3>{complaint.title}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  
                  <p className="complaint-description">
                    {complaint.description.substring(0, 150)}
                    {complaint.description.length > 150 ? '...' : ''}
                  </p>
                  
                  <div className="complaint-meta">
                    <span className="meta-item">
                      👤 {complaint.studentId?.name}
                    </span>
                    <span className="meta-item">
                      🏠 Room {complaint.roomNumber}
                    </span>
                    <span className="category">{complaint.category}</span>
                    <span 
                      className="priority" 
                      style={{ color: getPriorityColor(complaint.priority) }}
                    >
                      {complaint.priority} priority
                    </span>
                    <span className="meta-item">
                      💬 {complaint.commentCount || 0} comments
                    </span>
                    <span className="date">
                      📅 {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaints;