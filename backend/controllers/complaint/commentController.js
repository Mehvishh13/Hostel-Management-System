// controllers/complaint/commentController.js
// Top-level comments on a complaint.
const { ok, created, forbidden, handleError } = require('../../utils/apiResponse');
const { loadComplaint, loadComment, canModerate, toggleReaction } = require('./helpers');

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    complaint.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      comment: req.body.comment
    });

    await complaint.save();

    const comment = complaint.comments[complaint.comments.length - 1];

    return created(res, {
      message: 'Comment added successfully',
      data: { comment, commentCount: complaint.commentCount }
    });
  } catch (error) {
    return handleError(res, error, 'Add Comment Error', 'Error adding comment');
  }
};

// @desc    Delete comment
// @route   DELETE /api/complaints/:id/comment/:commentId
// @access  Private (author, admin or warden)
exports.deleteComment = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const comment = loadComment(req, res, complaint);
    if (!comment) return undefined;

    if (!canModerate(req, comment.userId)) {
      return forbidden(res, 'Not authorized to delete this comment');
    }

    complaint.comments.pull(req.params.commentId);
    await complaint.save();

    return ok(res, {
      message: 'Comment deleted successfully',
      data: { commentCount: complaint.commentCount }
    });
  } catch (error) {
    return handleError(res, error, 'Delete Comment Error', 'Error deleting comment');
  }
};

// Like and dislike are the same toggle over opposite arrays.
const react = (reaction, context) => async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const comment = loadComment(req, res, complaint);
    if (!comment) return undefined;

    const state = toggleReaction(comment, req.user._id, reaction);
    await complaint.save();

    return ok(res, {
      data: {
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        ...state
      }
    });
  } catch (error) {
    return handleError(res, error, context, `Error ${reaction === 'like' ? 'liking' : 'disliking'} comment`);
  }
};

// @route   POST /api/complaints/:id/comment/:commentId/like
exports.likeComment = react('like', 'Like Comment Error');

// @route   POST /api/complaints/:id/comment/:commentId/dislike
exports.dislikeComment = react('dislike', 'Dislike Comment Error');
