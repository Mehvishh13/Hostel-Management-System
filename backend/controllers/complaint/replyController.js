// controllers/complaint/replyController.js
// Replies nested under a complaint comment.
const { ok, created, forbidden, handleError } = require('../../utils/apiResponse');
const {
  loadComplaint,
  loadComment,
  loadReply,
  canModerate,
  toggleReaction
} = require('./helpers');

// @desc    Add reply to a comment
// @route   POST /api/complaints/:id/comment/:commentId/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const parentComment = loadComment(req, res, complaint);
    if (!parentComment) return undefined;

    parentComment.replies.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      comment: req.body.comment
    });

    await complaint.save();

    const reply = parentComment.replies[parentComment.replies.length - 1];

    return created(res, {
      message: 'Reply added successfully',
      data: { reply, replyCount: parentComment.replyCount }
    });
  } catch (error) {
    return handleError(res, error, 'Add Reply Error', 'Error adding reply');
  }
};

// @desc    Delete reply
// @route   DELETE /api/complaints/:id/comment/:commentId/reply/:replyId
// @access  Private (author, admin or warden)
exports.deleteReply = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const comment = loadComment(req, res, complaint);
    if (!comment) return undefined;

    const reply = loadReply(req, res, comment);
    if (!reply) return undefined;

    if (!canModerate(req, reply.userId)) {
      return forbidden(res, 'Not authorized to delete this reply');
    }

    comment.replies.pull(req.params.replyId);
    await complaint.save();

    return ok(res, {
      message: 'Reply deleted successfully',
      data: { replyCount: comment.replyCount }
    });
  } catch (error) {
    return handleError(res, error, 'Delete Reply Error', 'Error deleting reply');
  }
};

const react = (reaction, context) => async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const comment = loadComment(req, res, complaint);
    if (!comment) return undefined;

    const reply = loadReply(req, res, comment);
    if (!reply) return undefined;

    const state = toggleReaction(reply, req.user._id, reaction);
    await complaint.save();

    return ok(res, {
      data: {
        likeCount: reply.likeCount,
        dislikeCount: reply.dislikeCount,
        ...state
      }
    });
  } catch (error) {
    return handleError(res, error, context, `Error ${reaction === 'like' ? 'liking' : 'disliking'} reply`);
  }
};

// @route   POST /api/complaints/:id/comment/:commentId/reply/:replyId/like
exports.likeReply = react('like', 'Like Reply Error');

// @route   POST /api/complaints/:id/comment/:commentId/reply/:replyId/dislike
exports.dislikeReply = react('dislike', 'Dislike Reply Error');
