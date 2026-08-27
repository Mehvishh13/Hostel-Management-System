import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await api.get(`/api/groups/${id}`);
      setGroup(response.data.data);
      setUserRole(response.data.userRole);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupDetails();
    
    // Poll for new messages every 3 seconds only if user is a member
    const interval = setInterval(() => {
      if (userRole?.isMember) {
        fetchGroupDetails();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [fetchGroupDetails, userRole?.isMember]);

  useEffect(() => {
    scrollToBottom();
  }, [group?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoinGroup = async () => {
    try {
      const response = await api.post(
        `/api/groups/${id}/join`,
        {}
      );
      
      if (response.data.pending) {
        alert('Join request sent! Waiting for admin approval.');
      } else {
        alert('Successfully joined the group!');
      }
      
      fetchGroupDetails();
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleCancelRequest = async () => {
    try {
      await api.post(
        `/api/groups/${id}/cancel-request`,
        {}
      );
      
      alert('Join request cancelled');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(
        `/api/groups/${id}/messages`,
        { message: newMessage }
      );
      
      setNewMessage('');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await api.post(`/api/groups/${id}/leave`, {});
      
      alert('Successfully left the group');
      navigate('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await api.post(`/api/groups/${id}/make-admin/${userId}`, {});
      
      alert('User promoted to admin');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Failed to make admin');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/api/groups/${id}/members/${userId}`);
      
      alert('Member removed');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      await api.post(`/api/groups/${id}/approve/${userId}`, {});
      
      alert('Request approved');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await api.post(`/api/groups/${id}/reject/${userId}`, {});
      
      alert('Request rejected');
      fetchGroupDetails();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!group) {
    return <div style={styles.container}>Group not found</div>;
  }

  // Show join options if not a member
  if (!userRole?.isMember) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/groups')} style={styles.backBtn}>
          ← Back to Groups
        </button>

        <div style={styles.joinPrompt}>
          <div style={styles.groupPreview}>
            <h1>{group.name}</h1>
            <p style={styles.description}>{group.description}</p>
            <div style={styles.groupMeta}>
              <span>📂 {group.category}</span>
              <span>👥 {group.members?.length || 0} members</span>
              <span>{group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</span>
            </div>
          </div>

          {userRole?.isPending ? (
            <div style={styles.pendingSection}>
              <div style={styles.pendingIcon}>⏳</div>
              <h2>Join Request Pending</h2>
              <p>Your request to join this group is awaiting admin approval.</p>
              <button onClick={handleCancelRequest} style={styles.cancelRequestBtn}>
                Cancel Request
              </button>
            </div>
          ) : (
            <div style={styles.joinSection}>
              <div style={styles.joinIcon}>👥</div>
              <h2>Join this Group</h2>
              <p>
                {group.settings?.requireApproval
                  ? 'This group requires admin approval. Click below to send a join request.'
                  : 'Click below to join this group and start participating!'}
              </p>
              <button onClick={handleJoinGroup} style={styles.joinButton}>
                {group.settings?.requireApproval ? '🔔 Request to Join' : '➕ Join Group'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/groups')} style={styles.backBtn}>
        ← Back to Groups
      </button>

      <div style={styles.groupHeader}>
        <div style={styles.groupInfo}>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
          <div style={styles.groupMeta}>
            <span>📂 {group.category}</span>
            <span>👥 {group.members?.length || 0} members</span>
            <span>{group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</span>
          </div>
        </div>
        {userRole?.isMember && !userRole?.isCreator && (
          <button onClick={handleLeaveGroup} style={styles.leaveBtn}>
            Leave Group
          </button>
        )}
      </div>

      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'chat' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'members' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('members')}
        >
          👥 Members
        </button>
        {userRole?.isGroupAdmin && group.pendingRequests?.length > 0 && (
          <button
            style={{...styles.tab, ...(activeTab === 'requests' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('requests')}
          >
            🔔 Requests ({group.pendingRequests?.length})
          </button>
        )}
        {userRole?.isGroupAdmin && (
          <button
            style={{...styles.tab, ...(activeTab === 'settings' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      <div style={styles.content}>
        {activeTab === 'chat' && (
          <div style={styles.chatContainer}>
            <div style={styles.messages}>
              {!group.messages || group.messages.length === 0 ? (
                <div style={styles.emptyChat}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                group.messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.message,
                      ...(msg.userId?.toString() === user?._id?.toString() ? styles.myMessage : styles.otherMessage)
                    }}
                  >
                    {msg.userId?.toString() !== user?._id?.toString() && (
                      <div style={styles.senderName}>
                        {msg.userName}
                      </div>
                    )}
                    <div style={styles.messageContent}>{msg.message}</div>
                    <div style={styles.messageTime}>{formatTime(msg.createdAt)}</div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={styles.messageForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={styles.messageInput}
                disabled={group.settings?.onlyAdminsCanPost && !userRole?.isGroupAdmin}
              />
              <button 
                type="submit" 
                style={styles.sendBtn}
                disabled={group.settings?.onlyAdminsCanPost && !userRole?.isGroupAdmin}
              >
                Send
              </button>
            </form>
            {group.settings?.onlyAdminsCanPost && !userRole?.isGroupAdmin && (
              <div style={styles.restrictionNote}>
                Only admins can post messages in this group
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div style={styles.membersList}>
            {group.members?.map(member => (
              <div key={member._id} style={styles.memberCard}>
                <div style={styles.memberInfo}>
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                  {member.roomNumber && <p>Room: {member.roomNumber}</p>}
                  {group.admins?.some(a => (a._id || a) === member._id) && (
                    <span style={styles.adminBadge}>Admin</span>
                  )}
                  {group.creator === member._id && (
                    <span style={{...styles.adminBadge, background: '#f39c12'}}>Creator</span>
                  )}
                </div>
                
                {userRole?.isGroupAdmin && member._id !== user._id && (
                  <div style={styles.memberActions}>
                    {!group.admins?.some(a => (a._id || a) === member._id) && (
                      <button
                        onClick={() => handleMakeAdmin(member._id)}
                        style={styles.actionBtn}
                      >
                        Make Admin
                      </button>
                    )}
                    {group.creator !== member._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        style={{...styles.actionBtn, background: '#e74c3c'}}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && userRole?.isGroupAdmin && (
          <div style={styles.requestsList}>
            <h2>Pending Join Requests</h2>
            {group.pendingRequests?.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No pending requests</p>
              </div>
            ) : (
              group.pendingRequests?.map(request => (
                <div key={request._id} style={styles.requestCard}>
                  <div style={styles.requestInfo}>
                    <h3>{request.name}</h3>
                    <p>{request.email}</p>
                    {request.roomNumber && <p>Room: {request.roomNumber}</p>}
                  </div>
                  <div style={styles.requestActions}>
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      style={{...styles.actionBtn, background: '#27ae60'}}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      style={{...styles.actionBtn, background: '#e74c3c'}}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && userRole?.isGroupAdmin && (
          <div style={styles.settings}>
            <h2>Group Settings</h2>
            <div style={styles.settingsInfo}>
              <p><strong>Hide from Admin:</strong> {group.settings?.hiddenFromHostelAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Require Approval:</strong> {group.settings?.requireApproval ? 'Yes' : 'No'}</p>
              <p><strong>Only Admins Can Post:</strong> {group.settings?.onlyAdminsCanPost ? 'Yes' : 'No'}</p>
              <p><strong>Privacy:</strong> {group.privacy}</p>
              <p><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  backBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: '600'
  },
  joinPrompt: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  groupPreview: {
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '2px solid #f0f0f0'
  },
  description: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginTop: '15px'
  },
  joinSection: {
    padding: '30px'
  },
  joinIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  joinButton: {
    padding: '15px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  },
  pendingSection: {
    padding: '30px'
  },
  pendingIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  cancelRequestBtn: {
    padding: '12px 30px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  },
  groupHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  groupInfo: {
    flex: 1
  },
  groupMeta: {
    display: 'flex',
    gap: '20px',
    marginTop: '15px',
    fontSize: '14px',
    flexWrap: 'wrap'
  },
  leaveBtn: {
    padding: '10px 20px',
    background: 'rgba(231, 76, 60, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    background: 'white',
    padding: '10px',
    borderRadius: '12px',
    flexWrap: 'wrap'
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
    minWidth: '100px'
  },
  activeTab: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: 'transparent'
  },
  content: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '600px'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyChat: {
    textAlign: 'center',
    color: '#95a5a6',
    padding: '40px'
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word'
  },
  myMessage: {
    alignSelf: 'flex-end',
    background: '#667eea',
    color: 'white'
  },
  otherMessage: {
    alignSelf: 'flex-start',
    background: '#f0f0f0',
    color: '#2c3e50'
  },
  senderName: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '4px',
    opacity: 0.8
  },
  messageContent: {
    fontSize: '15px',
    lineHeight: '1.4'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px'
  },
  messageForm: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    borderTop: '2px solid #f0f0f0'
  },
  messageInput: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  },
  sendBtn: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  restrictionNote: {
    padding: '10px',
    background: '#fff3cd',
    color: '#856404',
    textAlign: 'center',
    fontSize: '14px'
  },
  membersList: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  memberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  memberInfo: {
    flex: 1
  },
  adminBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#667eea',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '5px',
    marginRight: '5px'
  },
  memberActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  requestsList: {
    padding: '30px'
  },
  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '15px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  requestInfo: {
    flex: 1
  },
  requestActions: {
    display: 'flex',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#95a5a6'
  },
  settings: {
    padding: '30px'
  },
  settingsInfo: {
    marginTop: '20px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    lineHeight: '2'
  }
};

export default GroupDetail;