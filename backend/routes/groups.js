// routes/groupRoutes.js
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
  deleteGroup,
  joinGroup,
  cancelRequest,  // NEW
  leaveGroup,
  makeAdmin,
  removeMember,
  addMessage,
  approveRequest,
  rejectRequest   // NEW
} = require('../controllers/groupController');

// Public group routes (all students can see)
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroup);

// Group management
router.post('/', protect, validate(createGroupSchema), createGroup);
router.put('/:id', protect, validate(updateGroupSchema), updateGroup);
router.delete('/:id', protect, deleteGroup);

// Join/Leave functionality
router.post('/:id/join', protect, joinGroup);
router.post('/:id/cancel-request', protect, cancelRequest); // NEW - Cancel join request
router.post('/:id/leave', protect, leaveGroup);

// Admin actions
router.post('/:id/make-admin/:userId', protect, makeAdmin);
router.delete('/:id/members/:userId', protect, removeMember);
router.post('/:id/approve/:userId', protect, approveRequest);
router.post('/:id/reject/:userId', protect, rejectRequest); // NEW - Reject request

// Messages
router.post('/:id/messages', protect, validate(groupMessageSchema), addMessage);

module.exports = router;