// pages/Dashboard.js - FIXED VERSION WITH REAL-TIME DATA
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isStudent, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent complaints
      const complaintsRes = await api.get('/api/complaints');
      
      // Handle both response formats
      const complaints = complaintsRes.data.data || complaintsRes.data;
      const complaintsArray = Array.isArray(complaints) ? complaints : [];
      
      setRecentComplaints(complaintsArray.slice(0, 5));

      // Calculate stats from actual data
      const stats = {
        total: complaintsArray.length,
        pending: complaintsArray.filter(c => c.status === 'pending').length,
        resolved: complaintsArray.filter(c => c.status === 'resolved').length,
        inProgress: complaintsArray.filter(c => c.status === 'in-progress').length
      };
      setStats(stats);

      console.log('📊 Dashboard Stats:', stats);
      console.log('📋 Recent Complaints:', complaintsArray.length);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="subtitle">
            {isStudent ? `Room ${user?.roomNumber}` : user?.role.toUpperCase()}
          </p>
        </div>
        {isStudent && (
          <Link to="/complaints/new" className="btn-primary">
            + New Complaint
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
            📋
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f39c12' }}>
            ⏳
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3498db' }}>
            🔄
          </div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#27ae60' }}>
            ✅
          </div>
          <div className="stat-info">
            <h3>{stats.resolved}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Complaints</h2>
          <Link to="/complaints" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="no-data">
            <p>No complaints yet</p>
            {isStudent && (
              <Link to="/complaints/new" className="btn-secondary">
                Create Your First Complaint
              </Link>
            )}
          </div>
        ) : (
          <div className="complaints-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  {!isStudent && <th>Room</th>}
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(complaint => (
                  <tr key={complaint._id}>
                    <td>{complaint.title}</td>
                    <td>
                      <span className="category-badge">{complaint.category}</span>
                    </td>
                    {!isStudent && <td>{complaint.roomNumber}</td>}
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-${complaint.priority}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link 
                        to={`/complaints/${complaint._id}`} 
                        className="view-link"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/complaints" className="action-card">
            <span className="action-icon">📝</span>
            <h3>View All Complaints</h3>
            <p>See all your complaints and their status</p>
          </Link>

          {isStudent && (
            <Link to="/complaints/new" className="action-card">
              <span className="action-icon">➕</span>
              <h3>New Complaint</h3>
              <p>Report a new issue or concern</p>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="action-card">
              <span className="action-icon">👔</span>
              <h3>Admin Dashboard</h3>
              <p>Manage all complaints and users</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;