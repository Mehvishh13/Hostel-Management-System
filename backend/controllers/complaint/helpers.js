// controllers/complaint/helpers.js
// Lookup helpers shared by the complaint, comment and reply controllers.
// Each returns null after answering the request, so callers can bail out with
// `if (!x) return;`.
const Complaint = require('../../models/Complaint');
const { notFound } = require('../../utils/apiResponse');

exports.loadComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    notFound(res, 'Complaint');
    return null;
  }
  return complaint;
};

exports.loadComment = (req, res, complaint) => {
  const comment = complaint.comments.id(req.params.commentId);
  if (!comment) {
    notFound(res, 'Comment');
    return null;
  }
  return comment;
};

exports.loadReply = (req, res, comment) => {
  const reply = comment.replies.id(req.params.replyId);
  if (!reply) {
    notFound(res, 'Reply');
    return null;
  }
  return reply;
};

// A student may only remove their own comment or reply; admins and wardens
// may remove anyone's.
exports.canModerate = (req, authorId) =>
  req.user.role !== 'student' || authorId.toString() === req.user._id.toString();

// Likes and dislikes are mutually exclusive toggles over two ObjectId arrays.
// Returns the resulting state so the caller can report it back.
exports.toggleReaction = (target, userId, reaction) => {
  const primary = reaction === 'like' ? target.likes : target.dislikes;
  const opposite = reaction === 'like' ? target.dislikes : target.likes;

  const oppositeIndex = opposite.findIndex((id) => id.toString() === userId.toString());
  if (oppositeIndex > -1) opposite.splice(oppositeIndex, 1);

  const index = primary.findIndex((id) => id.toString() === userId.toString());
  const isAdding = index === -1;

  if (isAdding) {
    primary.push(userId);
  } else {
    primary.splice(index, 1);
  }

  return {
    hasLiked: reaction === 'like' ? isAdding : false,
    hasDisliked: reaction === 'dislike' ? isAdding : false
  };
};
