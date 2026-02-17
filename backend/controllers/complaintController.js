// controllers/complaintController.js
const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Please provide title, description, and category' 
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      studentId: req.user._id,
      roomNumber: req.user.roomNumber
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating complaint',
      error: error.message 
    });
  }
};

// @desc    Get all complaints (filtered by role)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = { isPublic: true }; // Show all public complaints to everyone

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email roomNumber')
      .populate('resolvedBy', 'name')
      .sort({ voteCount: -1, createdAt: -1 }); // Sort by votes then date

    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get Complaints Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching complaints',
      error: error.message 
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email roomNumber phoneNumber')
      .populate('resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    // Privacy: Students can see all complaints but with limited info
    let complaintData = complaint.toObject();
    
    // If viewer is student and not the owner, hide sensitive info
    if (req.user.role === 'student' && 
        complaint.studentId._id.toString() !== req.user._id.toString()) {
      // Only show name, hide contact details
      complaintData.studentId = {
        _id: complaint.studentId._id,
        name: complaint.studentId.name,
        // email, phone, room hidden for privacy
      };
    }

    res.json({
      success: true,
      data: complaintData,
      canEdit: req.user.role !== 'student' || complaint.studentId._id.toString() === req.user._id.toString()
    });
  } catch (error) {
    console.error('Get Complaint Error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error fetching complaint',
      error: error.message 
    });
  }
};

// @desc    Update complaint status (Admin/Warden only)
// @route   PUT /api/complaints/:id
// @access  Private (Admin, Warden)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, adminNotes, priority } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    // Update fields
    if (status) complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (priority) complaint.priority = priority;
    
    if (status === 'resolved' || status === 'rejected') {
      complaint.resolvedBy = req.user._id;
    }

    await complaint.save();

    // Populate and return updated complaint
    complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email roomNumber')
      .populate('resolvedBy', 'name');

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Update Complaint Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating complaint',
      error: error.message 
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Student - own complaints, Admin/Warden - all)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    // Students can only delete their own complaints
    if (req.user.role === 'student' && 
        complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this complaint' 
      });
    }

    await complaint.deleteOne();
    
    res.json({ 
      success: true,
      message: 'Complaint deleted successfully' 
    });
  } catch (error) {
    console.error('Delete Complaint Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error deleting complaint',
      error: error.message 
    });
  }
};

// @desc    Get complaint statistics (Admin/Warden only)
// @route   GET /api/complaints/stats/overview
// @access  Private (Admin, Warden)
exports.getComplaintStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });

    res.json({
      success: true,
      data: {
        total: totalComplaints,
        pending: pendingComplaints,
        resolved: resolvedComplaints,
        inProgress: inProgressComplaints
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
};

// @desc    Vote for a complaint
// @route   POST /api/complaints/:id/vote
// @access  Private
exports.voteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    // Check if user already voted
    const alreadyVoted = complaint.votes.some(
      vote => vote.userId.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      // Remove vote (unvote)
      complaint.votes = complaint.votes.filter(
        vote => vote.userId.toString() !== req.user._id.toString()
      );
    } else {
      // Add vote
      complaint.votes.push({ userId: req.user._id });
    }

    await complaint.save();

    res.json({
      success: true,
      message: alreadyVoted ? 'Vote removed' : 'Vote added',
      voteCount: complaint.voteCount,
      hasVoted: !alreadyVoted
    });
  } catch (error) {
    console.error('Vote Complaint Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error voting complaint',
      error: error.message 
    });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Comment text is required' 
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    // Add comment
    complaint.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      comment: comment.trim()
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      commentCount: complaint.commentCount,
      comment: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error adding comment',
      error: error.message 
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/complaints/:id/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    const comment = complaint.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Only comment owner or admin can delete
    if (comment.userId.toString() !== req.user._id.toString() && 
        req.user.role === 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this comment' 
      });
    }

    complaint.comments.pull(req.params.commentId);
    await complaint.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentCount: complaint.commentCount
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint or comment not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error deleting comment',
      error: error.message 
    });
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/complaints/:id/comment/:commentId/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    const comment = complaint.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Remove from dislikes if exists
    const dislikeIndex = comment.dislikes.indexOf(req.user._id);
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    // Toggle like
    const likeIndex = comment.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user._id);
    }

    await complaint.save();

    res.json({
      success: true,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
      hasLiked: likeIndex === -1,
      hasDisliked: false
    });
  } catch (error) {
    console.error('Like Comment Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error liking comment',
      error: error.message 
    });
  }
};

// @desc    Dislike/Undislike a comment
// @route   POST /api/complaints/:id/comment/:commentId/dislike
// @access  Private
exports.dislikeComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    const comment = complaint.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Remove from likes if exists
    const likeIndex = comment.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    }

    // Toggle dislike
    const dislikeIndex = comment.dislikes.indexOf(req.user._id);
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    } else {
      comment.dislikes.push(req.user._id);
    }

    await complaint.save();

    res.json({
      success: true,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
      hasLiked: false,
      hasDisliked: dislikeIndex === -1
    });
  } catch (error) {
    console.error('Dislike Comment Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error disliking comment',
      error: error.message 
    });
  }
};

// @desc    Add reply to a comment
// @route   POST /api/complaints/:id/comment/:commentId/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Reply text is required' 
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    const parentComment = complaint.comments.id(req.params.commentId);

    if (!parentComment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Add reply
    parentComment.replies.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      comment: comment.trim()
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Reply added successfully',
      replyCount: parentComment.replyCount,
      reply: parentComment.replies[parentComment.replies.length - 1]
    });
  } catch (error) {
    console.error('Add Reply Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding reply',
      error: error.message 
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/complaints/:id/comment/:commentId/reply/:replyId
// @access  Private
exports.deleteReply = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ 
        success: false,
        message: 'Complaint not found' 
      });
    }

    const comment = complaint.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    const reply = comment.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ 
        success: false,
        message: 'Reply not found' 
      });
    }

    // Only reply owner or admin can delete
    if (reply.userId.toString() !== req.user._id.toString() && 
        req.user.role === 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this reply' 
      });
    }

    comment.replies.pull(req.params.replyId);
    await complaint.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully',
      replyCount: comment.replyCount
    });
  } catch (error) {
    console.error('Delete Reply Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting reply',
      error: error.message 
    });
  }
};

// @desc    Like/Unlike a reply
// @route   POST /api/complaints/:id/comment/:commentId/reply/:replyId/like
// @access  Private
exports.likeReply = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    const comment = complaint.comments.id(req.params.commentId);
    const reply = comment.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Remove from dislikes if exists
    const dislikeIndex = reply.dislikes.indexOf(req.user._id);
    if (dislikeIndex > -1) {
      reply.dislikes.splice(dislikeIndex, 1);
    }

    // Toggle like
    const likeIndex = reply.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.user._id);
    }

    await complaint.save();

    res.json({
      success: true,
      likeCount: reply.likeCount,
      dislikeCount: reply.dislikeCount,
      hasLiked: likeIndex === -1,
      hasDisliked: false
    });
  } catch (error) {
    console.error('Like Reply Error:', error);
    res.status(500).json({ success: false, message: 'Error liking reply' });
  }
};

// @desc    Dislike/Undislike a reply
// @route   POST /api/complaints/:id/comment/:commentId/reply/:replyId/dislike
// @access  Private
exports.dislikeReply = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    const comment = complaint.comments.id(req.params.commentId);
    const reply = comment.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Remove from likes if exists
    const likeIndex = reply.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    }

    // Toggle dislike
    const dislikeIndex = reply.dislikes.indexOf(req.user._id);
    if (dislikeIndex > -1) {
      reply.dislikes.splice(dislikeIndex, 1);
    } else {
      reply.dislikes.push(req.user._id);
    }

    await complaint.save();

    res.json({
      success: true,
      likeCount: reply.likeCount,
      dislikeCount: reply.dislikeCount,
      hasLiked: false,
      hasDisliked: dislikeIndex === -1
    });
  } catch (error) {
    console.error('Dislike Reply Error:', error);
    res.status(500).json({ success: false, message: 'Error disliking reply' });
  }
};