// routes/groups.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createGroupSchema,
  updateGroupSchema,
  groupMessageSchema
} = require('../middleware/schemas');
const {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/group/groupController');
const {
  joinGroup,
  cancelRequest,
  leaveGroup,
  makeAdmin,
  removeMember,
  approveRequest,
  rejectRequest
} = require('../controllers/group/membershipController');
const { addMessage } = require('../controllers/group/messageController');

// Browsing
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroup);

// Group management
router.post('/', protect, validate(createGroupSchema), createGroup);
router.put('/:id', protect, validate(updateGroupSchema), updateGroup);
router.delete('/:id', protect, deleteGroup);

// Membership
router.post('/:id/join', protect, joinGroup);
router.post('/:id/cancel-request', protect, cancelRequest);
router.post('/:id/leave', protect, leaveGroup);

// Group-admin actions
router.post('/:id/make-admin/:userId', protect, makeAdmin);
router.delete('/:id/members/:userId', protect, removeMember);
router.post('/:id/approve/:userId', protect, approveRequest);
router.post('/:id/reject/:userId', protect, rejectRequest);

// Messages
router.post('/:id/messages', protect, validate(groupMessageSchema), addMessage);

module.exports = router;
