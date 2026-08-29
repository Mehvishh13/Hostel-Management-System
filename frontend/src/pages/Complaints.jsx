// pages/Complaints.js - WITH VOTING DISPLAY
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Complaints.css';

const STAMP_META = {
  pending: { label: 'Pending', mark: 'pending' },
  'in-progress': { label: 'In progress', mark: 'progress' },
  resolved: { label: 'Resolved', mark: 'resolved' },
  rejected: { label: 'Rejected', mark: 'rejected' }
};

const Stamp = ({ status }) => {
  const meta = STAMP_META[status] || STAMP_META.pending;
  return <span className={`stamp stamp--${meta.mark}`}>{meta.label}</span>;
};

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
      const res = await api.get('/api/complaints');

      const complaintsData = res.data.data;
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError(error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
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
        <button onClick={fetchComplaints} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <div className="container">
        <div className="complaints-header">
          <div>
            <h1>All Complaints</h1>
            <p className="subtitle">View and support community complaints</p>
          </div>
          {isStudent && (
            <Link to="/complaints/new" className="pin-btn">
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
            <div className="card no-complaints">
              <p>No complaints found</p>
              {isStudent && filter === 'all' && (
                <Link to="/complaints/new" className="pin-btn" style={{ marginTop: '20px' }}>
                  Create Your First Complaint
                </Link>
              )}
            </div>
          ) : (
            filteredComplaints.map(complaint => (
              <Link
                to={`/complaints/${complaint._id}`}
                key={complaint._id}
                className="card complaint-card"
              >
                <div className="complaint-card-header">
                  <div className="complaint-votes">
                    <strong>{complaint.voteCount || 0}</strong>
                    <span>votes</span>
                  </div>

                  <div className="complaint-main-content">
                    <div className="complaint-header-row">
                      <h3>{complaint.title}</h3>
                      <Stamp status={complaint.status} />
                    </div>

                    <p className="complaint-description">
                      {complaint.description.substring(0, 150)}
                      {complaint.description.length > 150 ? '...' : ''}
                    </p>

                    <div className="complaint-meta">
                      <span className="meta-item">{complaint.studentId?.name || 'Anonymous'}</span>
                      <span className="sep">·</span>
                      <span className="tag-label">{complaint.category}</span>
                      <span className="sep">·</span>
                      <span className={`priority priority--${complaint.priority}`}>
                        {complaint.priority}
                      </span>
                      <span className="sep">·</span>
                      <span className="meta-item">{complaint.commentCount || 0} comments</span>
                      <span className="sep">·</span>
                      <span className="date">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Complaints;
