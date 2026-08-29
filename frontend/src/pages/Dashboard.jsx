// pages/Dashboard.jsx — The Notice Board
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

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

const Dashboard = () => {
  const { user, isStudent, isAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const complaintsRes = await api.get('/api/complaints');
      const complaints = complaintsRes.data.data;
      const complaintsArray = Array.isArray(complaints) ? complaints : [];

      setRecentComplaints(complaintsArray.slice(0, 5));

      setStats({
        total: complaintsArray.length,
        pending: complaintsArray.filter(c => c.status === 'pending').length,
        resolved: complaintsArray.filter(c => c.status === 'resolved').length,
        inProgress: complaintsArray.filter(c => c.status === 'in-progress').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="notice-board"><div className="loading">Loading dashboard…</div></div>;
  }

  return (
    <div className="notice-board">
      <div className="notice-board__inner container fade-in">
        <p className="board-title">Hostel Board · Notice Board</p>

        <div className="card header-card">
          <div>
            <h1 className="greeting">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="room-line">
              {isStudent ? (<>Room <b>{user?.roomNumber}</b></>) : <b>{user?.role?.toUpperCase()}</b>}
            </p>
          </div>
          {isStudent && (
            <Link to="/complaints/new" className="pin-btn">
              + New complaint
            </Link>
          )}
        </div>

        <div className="stats">
          <div className="card stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total complaints</div>
          </div>
          <div className="card stat-card stat-card--pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="card stat-card stat-card--progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In progress</div>
          </div>
          <div className="card stat-card stat-card--resolved">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <section>
          <div className="section-head">
            <h2>Recent complaints</h2>
            <Link to="/complaints">View all</Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="card notice notice--empty">
              <p>Nothing pinned to the board yet.</p>
              {isStudent && (
                <Link to="/complaints/new" className="btn btn-secondary">
                  Pin your first complaint
                </Link>
              )}
            </div>
          ) : (
            <div className="notices">
              {recentComplaints.map(complaint => (
                <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="card notice">
                  <p className="notice-title">{complaint.title}</p>
                  <div className="notice-meta">
                    {!isStudent && (
                      <>
                        <span>Room {complaint.roomNumber}</span>
                        <span className="sep">·</span>
                      </>
                    )}
                    <span>{complaint.category}</span>
                    <span className="sep">·</span>
                    <span className={`priority priority--${complaint.priority}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <div className="notice-footer">
                    <Stamp status={complaint.status} />
                    <span className="notice-date">
                      {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="section-head">
            <h2>Quick actions</h2>
          </div>
          <div className="quick-grid">
            <Link to="/complaints" className="card quick-card">
              <h3>All complaints</h3>
              <p>See every report and its status</p>
            </Link>

            {isStudent && (
              <Link to="/complaints/new" className="card quick-card">
                <h3>New complaint</h3>
                <p>Report a new issue or concern</p>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="card quick-card">
                <h3>Admin panel</h3>
                <p>Manage all complaints and users</p>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
