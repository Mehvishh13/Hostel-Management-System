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
      setUserRole(response.data.meta.userStatus);
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

      if (response.data.data.pending) {
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
    return <div style={styles.container}>Loading…</div>;
  }

  if (!group) {
    return <div style={styles.container}>Group not found</div>;
  }

  // Show join options if not a member
  if (!userRole?.isMember) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/groups')} style={styles.backBtn}>
          ← Back to groups
        </button>

        <div style={styles.joinPrompt}>
          <div style={styles.groupPreview}>
            <h1 style={styles.h1}>{group.name}</h1>
            <p style={styles.description}>{group.description}</p>
            <div style={styles.groupMeta}>
              <span>{group.category}</span>
              <span className="meta-sep">·</span>
              <span>{group.members?.length || 0} members</span>
              <span className="meta-sep">·</span>
              <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
            </div>
          </div>

          {userRole?.isPending ? (
            <div style={styles.pendingSection}>
              <h2 style={styles.h2}>Join request pending</h2>
              <p>Your request to join this group is awaiting admin approval.</p>
              <button onClick={handleCancelRequest} style={styles.cancelRequestBtn}>
                Cancel request
              </button>
            </div>
          ) : (
            <div style={styles.joinSection}>
              <h2 style={styles.h2}>Join this group</h2>
              <p>
                {group.settings?.requireApproval
                  ? 'This group requires admin approval. Click below to send a join request.'
                  : 'Click below to join this group and start participating!'}
              </p>
              <button onClick={handleJoinGroup} style={styles.joinButton}>
                {group.settings?.requireApproval ? 'Request to join' : 'Join group'}
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
        ← Back to groups
      </button>

      <div style={styles.groupHeader}>
        <div style={styles.groupInfo}>
          <h1 style={styles.h1}>{group.name}</h1>
          <p>{group.description}</p>
          <div style={styles.groupMeta}>
            <span>{group.category}</span>
            <span className="meta-sep">·</span>
            <span>{group.members?.length || 0} members</span>
            <span className="meta-sep">·</span>
            <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
          </div>
        </div>
        {userRole?.isMember && !userRole?.isCreator && (
          <button onClick={handleLeaveGroup} style={styles.leaveBtn}>
            Leave group
          </button>
        )}
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'chat' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'members' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        {userRole?.isGroupAdmin && group.pendingRequests?.length > 0 && (
          <button
            style={{ ...styles.tab, ...(activeTab === 'requests' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({group.pendingRequests?.length})
          </button>
        )}
        {userRole?.isGroupAdmin && (
          <button
            style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('settings')}
          >
            Settings
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
                placeholder="Type a message…"
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
                  <h3 style={styles.h3}>{member.name}</h3>
                  <p>{member.email}</p>
                  {member.roomNumber && <p>Room: {member.roomNumber}</p>}
                  {group.admins?.some(a => (a._id || a) === member._id) && (
                    <span style={styles.stampAdmin}>Admin</span>
                  )}
                  {group.creator === member._id && (
                    <span style={styles.stampCreator}>Creator</span>
                  )}
                </div>

                {userRole?.isGroupAdmin && member._id !== user._id && (
                  <div style={styles.memberActions}>
                    {!group.admins?.some(a => (a._id || a) === member._id) && (
                      <button
                        onClick={() => handleMakeAdmin(member._id)}
                        style={styles.actionBtn}
                      >
                        Make admin
                      </button>
                    )}
                    {group.creator !== member._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        style={styles.actionBtnDanger}
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
            <h2 style={styles.h2}>Pending join requests</h2>
            {group.pendingRequests?.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No pending requests</p>
              </div>
            ) : (
              group.pendingRequests?.map(request => (
                <div key={request._id} style={styles.requestCard}>
                  <div style={styles.requestInfo}>
                    <h3 style={styles.h3}>{request.name}</h3>
                    <p>{request.email}</p>
                    {request.roomNumber && <p>Room: {request.roomNumber}</p>}
                  </div>
                  <div style={styles.requestActions}>
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      style={styles.actionBtnApprove}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      style={styles.actionBtnDanger}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && userRole?.isGroupAdmin && (
          <div style={styles.settings}>
            <h2 style={styles.h2}>Group settings</h2>
            <div style={styles.settingsInfo}>
              <p><strong>Hide from admin:</strong> {group.settings?.hiddenFromHostelAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Require approval:</strong> {group.settings?.requireApproval ? 'Yes' : 'No'}</p>
              <p><strong>Only admins can post:</strong> {group.settings?.onlyAdminsCanPost ? 'Yes' : 'No'}</p>
              <p><strong>Privacy:</strong> {group.privacy}</p>
              <p><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Dense/operate surface (chat, tables, forms) — flat paper panels, hairline
   dividers, no pin/rotation per DESIGN.md's dense-page rule. */
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px 64px',
    background: 'var(--page-bg)',
    minHeight: 'calc(100vh - 66px)',
    fontFamily: 'var(--font-body)',
    color: 'var(--ink)'
  },
  h1: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '24px', margin: 0, color: 'var(--ink)' },
  h2: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '19px', margin: '0 0 10px', color: 'var(--ink)' },
  h3: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '15px', margin: '0 0 4px', color: 'var(--ink)' },
  backBtn: {
    padding: '9px 16px',
    background: 'transparent',
    color: 'var(--ink-dim)',
    border: '1.5px solid var(--paper-line)',
    cursor: 'pointer',
    marginBottom: '20px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: '13px'
  },
  joinPrompt: {
    background: 'var(--paper)',
    padding: '40px',
    border: '1px solid var(--paper-line)',
    textAlign: 'center'
  },
  groupPreview: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--paper-line)'
  },
  description: {
    fontSize: '15px',
    color: 'var(--ink-dim)',
    marginTop: '14px'
  },
  joinSection: { padding: '20px' },
  joinButton: {
    padding: '13px 32px',
    background: 'var(--pin-red)',
    color: 'var(--paper)',
    border: 'none',
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '18px',
    boxShadow: '0 4px 0 var(--pin-red-deep)'
  },
  pendingSection: { padding: '20px' },
  cancelRequestBtn: {
    padding: '11px 26px',
    background: 'transparent',
    color: 'var(--ink-dim)',
    border: '1.5px solid var(--paper-line)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '18px'
  },
  groupHeader: {
    background: 'var(--paper)',
    border: '1px solid var(--paper-line)',
    color: 'var(--ink)',
    padding: '26px',
    marginBottom: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap'
  },
  groupInfo: { flex: 1, minWidth: '200px' },
  groupMeta: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    fontSize: '12.5px',
    color: 'var(--ink-dim)',
    fontFamily: 'var(--font-mono)',
    flexWrap: 'wrap',
    alignItems: 'baseline'
  },
  leaveBtn: {
    padding: '9px 16px',
    background: 'transparent',
    color: 'var(--pin-red)',
    border: '1.5px solid var(--pin-red)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px'
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '18px',
    borderBottom: '1px solid var(--paper-line)',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '10px 16px',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--ink-dim)'
  },
  activeTab: {
    color: 'var(--pin-red)',
    borderBottomColor: 'var(--pin-red)'
  },
  content: {
    background: 'var(--paper)',
    border: '1px solid var(--paper-line)',
    overflow: 'hidden'
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
    color: 'var(--ink-faint)',
    padding: '40px'
  },
  message: {
    maxWidth: '70%',
    padding: '11px 15px',
    wordWrap: 'break-word'
  },
  myMessage: {
    alignSelf: 'flex-end',
    background: 'var(--pin-red)',
    color: 'var(--paper)'
  },
  otherMessage: {
    alignSelf: 'flex-start',
    background: 'var(--page-bg)',
    color: 'var(--ink)'
  },
  senderName: {
    fontSize: '11.5px',
    fontWeight: 600,
    marginBottom: '4px',
    opacity: 0.8
  },
  messageContent: {
    fontSize: '14.5px',
    lineHeight: '1.4'
  },
  messageTime: {
    fontSize: '10.5px',
    fontFamily: 'var(--font-mono)',
    opacity: 0.7,
    marginTop: '4px'
  },
  messageForm: {
    display: 'flex',
    gap: '10px',
    padding: '18px',
    borderTop: '1px solid var(--paper-line)'
  },
  messageInput: {
    flex: 1,
    padding: '10px 2px',
    border: 'none',
    borderBottom: '1.5px solid var(--paper-line)',
    background: 'transparent',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--ink)',
    outline: 'none'
  },
  sendBtn: {
    padding: '10px 22px',
    background: 'var(--pin-red)',
    color: 'var(--paper)',
    border: 'none',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    cursor: 'pointer'
  },
  restrictionNote: {
    padding: '10px',
    background: 'var(--page-bg)',
    color: 'var(--ink-dim)',
    textAlign: 'center',
    fontSize: '13px',
    borderTop: '1px solid var(--paper-line)'
  },
  membersList: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    background: 'var(--paper-line)'
  },
  memberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'var(--paper)',
    flexWrap: 'wrap',
    gap: '10px'
  },
  memberInfo: { flex: 1 },
  stampAdmin: {
    display: 'inline-block',
    fontFamily: 'var(--font-display)',
    fontSize: '10px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    border: '1.5px solid var(--ink-dim)',
    color: 'var(--ink-dim)',
    marginTop: '4px',
    marginRight: '5px'
  },
  stampCreator: {
    display: 'inline-block',
    fontFamily: 'var(--font-display)',
    fontSize: '10px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    border: '1.5px solid var(--twine)',
    color: 'var(--twine)',
    marginTop: '4px',
    marginRight: '5px'
  },
  memberActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '7px 14px',
    background: 'transparent',
    color: 'var(--ink)',
    border: '1.5px solid var(--paper-line)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  },
  actionBtnDanger: {
    padding: '7px 14px',
    background: 'transparent',
    color: 'var(--pin-red)',
    border: '1.5px solid var(--pin-red)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  },
  actionBtnApprove: {
    padding: '7px 14px',
    background: 'var(--resolved-green)',
    color: 'var(--paper)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  },
  requestsList: { padding: '24px' },
  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--page-bg)',
    marginTop: '12px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  requestInfo: { flex: 1 },
  requestActions: { display: 'flex', gap: '8px' },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--ink-faint)'
  },
  settings: { padding: '24px' },
  settingsInfo: {
    marginTop: '16px',
    padding: '18px',
    background: 'var(--page-bg)',
    lineHeight: '2',
    fontSize: '14px'
  }
};

export default GroupDetail;
