// components/TelegramComments.js - TELEGRAM STYLE WITH REPLIES
import React, { useState } from 'react';
import axios from 'axios';
import './TelegramComments.css';

const TelegramComments = ({ complaintId, comments, currentUser, onUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [loading, setLoading] = useState(false);

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago";
    
    return new Date(date).toLocaleDateString();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/complaints/${complaintId}/comment`, {
        comment: newComment
      });
      
      setNewComment('');
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/reply`,
        { comment: replyText }
      );
      
      setReplyText('');
      setReplyingTo(null);
      onUpdate();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId, isReply, replyId) => {
    try {
      const url = isReply 
        ? `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/reply/${replyId}/like`
        : `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/like`;
      
      await axios.post(url);
      onUpdate();
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleDislike = async (commentId, isReply, replyId) => {
    try {
      const url = isReply 
        ? `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/reply/${replyId}/dislike`
        : `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/dislike`;
      
      await axios.post(url);
      onUpdate();
    } catch (error) {
      console.error('Error disliking:', error);
    }
  };

  const handleDelete = async (commentId, isReply, replyId) => {
    if (!window.confirm('Delete this ' + (isReply ? 'reply' : 'comment') + '?')) return;
    
    try {
      const url = isReply 
        ? `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}/reply/${replyId}`
        : `http://localhost:5000/api/complaints/${complaintId}/comment/${commentId}`;
      
      await axios.delete(url);
      onUpdate();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const isUserMessage = (userId) => {
    return userId === currentUser._id || userId._id === currentUser._id;
  };

  const hasUserLiked = (likes) => {
    return likes?.some(id => id === currentUser._id || id._id === currentUser._id);
  };

  const hasUserDisliked = (dislikes) => {
    return dislikes?.some(id => id === currentUser._id || id._id === currentUser._id);
  };

  return (
    <div className="telegram-comments">
      <div className="comments-header">
        <h3>💬 Discussion ({comments?.length || 0})</h3>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="telegram-input-container">
        <div className="telegram-input-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a message..."
            rows="1"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={loading || !newComment.trim()}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="telegram-messages">
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            const isOwnMessage = isUserMessage(comment.userId);
            const userLiked = hasUserLiked(comment.likes);
            const userDisliked = hasUserDisliked(comment.dislikes);

            return (
              <div key={comment._id} className="comment-thread">
                {/* Main Comment */}
                <div className={`telegram-message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                  <div className="message-bubble">
                    <div className="message-header">
                      <span className="message-author">
                        {comment.userName}
                        <span className={`role-badge badge-${comment.userRole}`}>
                          {comment.userRole}
                        </span>
                      </span>
                      <span className="message-time">{getTimeSince(comment.createdAt)}</span>
                    </div>
                    
                    <div className="message-text">
                      {comment.comment}
                    </div>
                    
                    <div className="message-actions">
                      <button 
                        className={`action-btn ${userLiked ? 'active-like' : ''}`}
                        onClick={() => handleLike(comment._id, false)}
                      >
                        👍 {comment.likeCount || 0}
                      </button>
                      
                      <button 
                        className={`action-btn ${userDisliked ? 'active-dislike' : ''}`}
                        onClick={() => handleDislike(comment._id, false)}
                      >
                        👎 {comment.dislikeCount || 0}
                      </button>
                      
                      <button 
                        className="action-btn"
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      >
                        💬 Reply
                      </button>
                      
                      {(isOwnMessage || currentUser.role !== 'student') && (
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(comment._id, false)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {/* Show replies count */}
                    {comment.replies && comment.replies.length > 0 && (
                      <button 
                        className="show-replies-btn"
                        onClick={() => toggleReplies(comment._id)}
                      >
                        {showReplies[comment._id] ? '▼' : '►'} 
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Input */}
                {replyingTo === comment._id && (
                  <div className="reply-input-container">
                    <div className="reply-line"></div>
                    <div className="reply-input-wrapper">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.userName}...`}
                        rows="1"
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddReply(comment._id);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleAddReply(comment._id)}
                        className="send-button"
                        disabled={loading || !replyText.trim()}
                      >
                        {loading ? '⏳' : '📤'}
                      </button>
                      <button 
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="cancel-button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies Thread */}
                {showReplies[comment._id] && comment.replies && comment.replies.length > 0 && (
                  <div className="replies-container">
                    <div className="reply-line"></div>
                    <div className="replies-list">
                      {comment.replies.map((reply) => {
                        const isOwnReply = isUserMessage(reply.userId);
                        const userLikedReply = hasUserLiked(reply.likes);
                        const userDislikedReply = hasUserDisliked(reply.dislikes);

                        return (
                          <div 
                            key={reply._id} 
                            className={`telegram-message reply-message ${isOwnReply ? 'own-message' : 'other-message'}`}
                          >
                            <div className="message-bubble">
                              <div className="message-header">
                                <span className="message-author">
                                  {reply.userName}
                                  <span className={`role-badge badge-${reply.userRole}`}>
                                    {reply.userRole}
                                  </span>
                                </span>
                                <span className="message-time">{getTimeSince(reply.createdAt)}</span>
                              </div>
                              
                              <div className="message-text">
                                {reply.comment}
                              </div>
                              
                              <div className="message-actions">
                                <button 
                                  className={`action-btn ${userLikedReply ? 'active-like' : ''}`}
                                  onClick={() => handleLike(comment._id, true, reply._id)}
                                >
                                  👍 {reply.likeCount || 0}
                                </button>
                                
                                <button 
                                  className={`action-btn ${userDislikedReply ? 'active-dislike' : ''}`}
                                  onClick={() => handleDislike(comment._id, true, reply._id)}
                                >
                                  👎 {reply.dislikeCount || 0}
                                </button>
                                
                                {(isOwnReply || currentUser.role !== 'student') && (
                                  <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDelete(comment._id, true, reply._id)}
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-messages">
            <p>No comments yet. Start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramComments;