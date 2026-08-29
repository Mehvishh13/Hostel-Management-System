// pages/ComplaintDetail.js - WITH TELEGRAM COMMENTS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import TelegramComments from '../components/TelegramComments';
import './ComplaintDetail.css';

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

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    adminNotes: '',
    priority: ''
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/api/complaints/${id}`);
      const complaintData = res.data.data;
      setComplaint(complaintData);
      setCanEdit(res.data.meta?.canEdit === true);
      setUpdateForm({
        status: complaintData.status,
        adminNotes: complaintData.adminNotes || '',
        priority: complaintData.priority
      });

      // Check if current user has voted
      const voted = complaintData.votes?.some(vote =>
        vote.userId === user._id || vote.userId._id === user._id
      );
      setHasVoted(voted);

    } catch (error) {
      console.error('Error fetching complaint:', error);
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    setVoting(true);
    try {
      const res = await api.post(`/api/complaints/${id}/vote`);

      setHasVoted(res.data.data.hasVoted);
      setComplaint(prev => ({
        ...prev,
        voteCount: res.data.data.voteCount
      }));

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put(`/api/complaints/${id}`, updateForm);
      await fetchComplaint();
      setShowUpdateForm(false);
      alert('Complaint updated successfully!');
    } catch (error) {
      alert('Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/api/complaints/${id}`);
        navigate('/complaints');
      } catch (error) {
        alert('Failed to delete complaint');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  const isOwner = complaint.studentId?._id === user._id || complaint.studentId === user._id;

  return (
    <div className="complaint-detail-container">
      <div className="container">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/complaints')}>
            ← Back to Complaints
          </button>
          <div className="header-actions">
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => setShowUpdateForm(!showUpdateForm)}
              >
                {showUpdateForm ? 'Cancel Update' : 'Update Status'}
              </button>
            )}
            {canEdit && complaint.status === 'pending' && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Complaint
              </button>
            )}
          </div>
        </div>

        <div className="card complaint-detail-card">
          {/* Main Header Section */}
          <div className="complaint-header-section">
            <div className="header-left">
              <h1 className="complaint-title">{complaint.title}</h1>
              <div className="complaint-meta-badges">
                <Stamp status={complaint.status} />
                <span className="tag-label">{complaint.category}</span>
                <span className="sep">·</span>
                <span className={`priority priority--${complaint.priority}`}>
                  {complaint.priority} priority
                </span>
              </div>
            </div>

            {/* Voting Section */}
            <div className="voting-section">
              <button
                className={`btn btn-secondary vote-btn ${hasVoted ? 'voted' : ''}`}
                onClick={handleVote}
                disabled={voting}
              >
                {hasVoted ? 'Voted' : 'Support'}
              </button>
              <div className="vote-count">
                <strong>{complaint.voteCount || 0}</strong>
                <span>{complaint.voteCount === 1 ? 'vote' : 'votes'}</span>
              </div>
              <div className="comment-indicator">
                <span className="comment-count">{complaint.commentCount || 0}</span>
                <span>comments</span>
              </div>
            </div>
          </div>

          {/* Update Form for Admin/Warden */}
          {isAdmin && showUpdateForm && (
            <form onSubmit={handleUpdate} className="update-form">
              <h3>Update Complaint Status</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={updateForm.priority}
                    onChange={(e) => setUpdateForm({...updateForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={updateForm.adminNotes}
                  onChange={(e) => setUpdateForm({...updateForm, adminNotes: e.target.value})}
                  placeholder="Add notes or comments..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Description Section */}
          <div className="detail-section">
            <h3 className="section-title">Complaint Description</h3>
            <div className="description-box">
              <p className="description-text">{complaint.description}</p>
            </div>
          </div>

          {/* Student Information - Privacy based on role */}
          <div className="detail-section">
            <h3 className="section-title">Student Information</h3>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-label">Name</span>
                <span className="info-value">{complaint.studentId?.name || 'Anonymous'}</span>
              </div>

              {/* Show full details only to admin/warden or complaint owner */}
              {(isAdmin || isOwner) && (
                <>
                  <div className="info-card">
                    <span className="info-label">Email</span>
                    <span className="info-value">{complaint.studentId?.email || 'Hidden'}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Room Number</span>
                    <span className="info-value">{complaint.roomNumber}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{complaint.studentId?.phoneNumber || 'Hidden'}</span>
                  </div>
                </>
              )}

            </div>

            {!isAdmin && !isOwner && (
              <div className="privacy-note">
                <small>Room and contact details are private. Only admins/wardens and the complaint's author can see them.</small>
              </div>
            )}
          </div>

          {/* Timeline Information */}
          <div className="detail-section">
            <h3 className="section-title">Timeline</h3>
            <div className="timeline-grid">
              <div className="timeline-item">
                <div className="timeline-content">
                  <span className="timeline-label">Submitted</span>
                  <span className="timeline-value">{formatDate(complaint.createdAt)}</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-content">
                  <span className="timeline-label">Last Updated</span>
                  <span className="timeline-value">{formatDate(complaint.updatedAt)}</span>
                </div>
              </div>
              {complaint.resolvedBy && (
                <div className="timeline-item">
                  <div className="timeline-content">
                    <span className="timeline-label">Resolved By</span>
                    <span className="timeline-value">{complaint.resolvedBy?.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {complaint.adminNotes && (
            <div className="detail-section">
              <h3 className="section-title">Admin Notes</h3>
              <div className="admin-notes-box">
                <p>{complaint.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Comments Section - TELEGRAM STYLE */}
          <TelegramComments
            complaintId={id}
            comments={complaint.comments}
            currentUser={user}
            onUpdate={fetchComplaint}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
