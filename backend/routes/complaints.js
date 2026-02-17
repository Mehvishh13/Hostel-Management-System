// routes/complaints.js - COMPLETE WITH REPLIES & LIKES
const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  voteComplaint,
  addComment,
  deleteComment,
  likeComment,
  dislikeComment,
  addReply,
  deleteReply,
  likeReply,
  dislikeReply
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Complaint routes
router.route('/')
  .get(protect, getComplaints)
  .post(protect, authorize('student'), createComplaint);

router.route('/stats/overview')
  .get(protect, authorize('admin', 'warden'), getComplaintStats);

router.route('/:id')
  .get(protect, getComplaint)
  .put(protect, authorize('admin', 'warden'), updateComplaint)
  .delete(protect, deleteComplaint);

// Vote route
router.route('/:id/vote')
  .post(protect, voteComplaint);

// Comment routes
router.route('/:id/comment')
  .post(protect, addComment);

router.route('/:id/comment/:commentId')
  .delete(protect, deleteComment);

router.route('/:id/comment/:commentId/like')
  .post(protect, likeComment);

router.route('/:id/comment/:commentId/dislike')
  .post(protect, dislikeComment);

// Reply routes
router.route('/:id/comment/:commentId/reply')
  .post(protect, addReply);

router.route('/:id/comment/:commentId/reply/:replyId')
  .delete(protect, deleteReply);

router.route('/:id/comment/:commentId/reply/:replyId/like')
  .post(protect, likeReply);

router.route('/:id/comment/:commentId/reply/:replyId/dislike')
  .post(protect, dislikeReply);

module.exports = router;