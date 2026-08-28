// pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  });
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/complaints');
      const complaints = res.data.data;
      
      setComplaints(complaints);
      
      // Calculate stats
      const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        inProgress: complaints.filter(c => c.status === 'in-progress').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = filter === 'all' || complaint.status === filter;
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Manage all hostel complaints</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
            📊
          </div>
          <div className="stat-content">
            <h2>{stats.total}</h2>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>
            ⏳
          </div>
          <div className="stat-content">
            <h2>{stats.pending}</h2>
            <p>Pending</p>
            <small>{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
            🔄
          </div>
          <div className="stat-content">
            <h2>{stats.inProgress}</h2>
            <p>In Progress</p>
            <small>{stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total</small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#27ae60' }}>
            ✅
          </div>
          <div className="stat-content">
            <h2>{stats.resolved}</h2>
            <p>Resolved</p>
            <small>{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% of total</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="security">Security</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </div>

      {/* Complaints Table */}
      <div className="admin-table-container">
        {filteredComplaints.length === 0 ? (
          <div className="no-data">
            <p>No complaints found with the selected filters</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Room</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint, index) => (
                <tr key={complaint._id}>
                  <td>#{index + 1}</td>
                  <td className="complaint-title">
                    <strong>{complaint.title}</strong>
                    <small>{complaint.description.substring(0, 50)}...</small>
                  </td>
                  <td>
                    <div className="student-info">
                      <strong>{complaint.studentId?.name}</strong>
                      <small>{complaint.studentId?.email}</small>
                    </div>
                  </td>
                  <td>{complaint.roomNumber}</td>
                  <td>
                    <span className="category-badge">{complaint.category}</span>
                  </td>
                  <td>
                    <span 
                      className="priority-indicator"
                      style={{ color: getPriorityColor(complaint.priority) }}
                    >
                      ⬤ {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-info">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                      <small>{new Date(complaint.createdAt).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <Link 
                      to={`/complaints/${complaint._id}`} 
                      className="action-btn"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Stats by Category */}
      <div className="category-stats">
        <h2>Complaints by Category</h2>
        <div className="category-grid">
          {['maintenance', 'cleanliness', 'security', 'food', 'other'].map(category => {
            const count = complaints.filter(c => c.category === category).length;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            
            return (
              <div key={category} className="category-stat-card">
                <h3>{category}</h3>
                <div className="count">{count}</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <small>{percentage}% of total</small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;