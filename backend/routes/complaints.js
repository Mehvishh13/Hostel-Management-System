// routes/complaints.js
const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  voteComplaint
} = require('../controllers/complaint/complaintController');
const {
  addComment,
  deleteComment,
  likeComment,
  dislikeComment
} = require('../controllers/complaint/commentController');
const {
  addReply,
  deleteReply,
  likeReply,
  dislikeReply
} = require('../controllers/complaint/replyController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createComplaintSchema,
  updateComplaintSchema,
  commentSchema
} = require('../middleware/schemas');

const router = express.Router();

// Complaints
router.route('/')
  .get(protect, getComplaints)
  .post(protect, authorize('student'), validate(createComplaintSchema), createComplaint);

router.route('/stats/overview')
  .get(protect, authorize('admin', 'warden'), getComplaintStats);

router.route('/:id')
  .get(protect, getComplaint)
  .put(protect, authorize('admin', 'warden'), validate(updateComplaintSchema), updateComplaint)
  .delete(protect, deleteComplaint);

router.route('/:id/vote')
  .post(protect, voteComplaint);

// Comments
router.route('/:id/comment')
  .post(protect, validate(commentSchema), addComment);

router.route('/:id/comment/:commentId')
  .delete(protect, deleteComment);

router.route('/:id/comment/:commentId/like')
  .post(protect, likeComment);

router.route('/:id/comment/:commentId/dislike')
  .post(protect, dislikeComment);

// Replies
router.route('/:id/comment/:commentId/reply')
  .post(protect, validate(commentSchema), addReply);

router.route('/:id/comment/:commentId/reply/:replyId')
  .delete(protect, deleteReply);

router.route('/:id/comment/:commentId/reply/:replyId/like')
  .post(protect, likeReply);

router.route('/:id/comment/:commentId/reply/:replyId/dislike')
  .post(protect, dislikeReply);

module.exports = router;
