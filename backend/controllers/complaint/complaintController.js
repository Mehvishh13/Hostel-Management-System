// controllers/complaint/complaintController.js
// Complaint lifecycle: create, read, update, delete, statistics and voting.
// Comment and reply handling live in sibling modules.
const Complaint = require('../../models/Complaint');
const { ok, created, notFound, forbidden, handleError } = require('../../utils/apiResponse');
const { loadComplaint } = require('./helpers');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      studentId: req.user._id,
      roomNumber: req.user.roomNumber
    });

    return created(res, { data: complaint, message: 'Complaint created' });
  } catch (error) {
    return handleError(res, error, 'Create Complaint Error', 'Error creating complaint');
  }
};

// @desc    Get all public complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isPublic: true })
      .populate('studentId', 'name email roomNumber')
      .populate('resolvedBy', 'name')
      .sort({ voteCount: -1, createdAt: -1 });

    const isPrivileged = req.user.role !== 'student';

    // Students see other students' complaints with identity limited to a name —
    // room/email are only for the complaint owner and staff who need to act on it.
    const data = complaints.map((complaint) => {
      const obj = complaint.toObject();
      const isOwner = complaint.studentId?._id?.toString() === req.user._id.toString();

      if (!isPrivileged && !isOwner) {
        obj.studentId = complaint.studentId
          ? { _id: complaint.studentId._id, name: complaint.studentId.name }
          : null;
        delete obj.roomNumber;
      }

      return obj;
    });

    return ok(res, { data, meta: { count: data.length } });
  } catch (error) {
    return handleError(res, error, 'Get Complaints Error', 'Error fetching complaints');
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

    if (!complaint) return notFound(res, 'Complaint');

    const isOwner = complaint.studentId._id.toString() === req.user._id.toString();
    const complaintData = complaint.toObject();

    // Students see other students' complaints without contact details.
    if (req.user.role === 'student' && !isOwner) {
      complaintData.studentId = {
        _id: complaint.studentId._id,
        name: complaint.studentId.name
      };
      delete complaintData.roomNumber;
    }

    return ok(res, {
      data: complaintData,
      meta: { canEdit: req.user.role !== 'student' || isOwner }
    });
  } catch (error) {
    return handleError(res, error, 'Get Complaint Error', 'Error fetching complaint');
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin, Warden)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, adminNotes, priority } = req.body;

    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    if (status) complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (priority) complaint.priority = priority;

    if (status === 'resolved' || status === 'rejected') {
      complaint.resolvedBy = req.user._id;
    }

    await complaint.save();

    const updated = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email roomNumber')
      .populate('resolvedBy', 'name');

    return ok(res, { data: updated, message: 'Complaint updated' });
  } catch (error) {
    return handleError(res, error, 'Update Complaint Error', 'Error updating complaint');
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Student - own only, Admin/Warden - all)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    if (
      req.user.role === 'student' &&
      complaint.studentId.toString() !== req.user._id.toString()
    ) {
      return forbidden(res, 'Not authorized to delete this complaint');
    }

    await complaint.deleteOne();

    return ok(res, { message: 'Complaint deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Delete Complaint Error', 'Error deleting complaint');
  }
};

// @desc    Complaint statistics
// @route   GET /api/complaints/stats/overview
// @access  Private (Admin, Warden)
exports.getComplaintStats = async (req, res) => {
  try {
    const [total, pending, resolved, inProgress] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'in-progress' })
    ]);

    return ok(res, { data: { total, pending, resolved, inProgress } });
  } catch (error) {
    return handleError(res, error, 'Get Stats Error', 'Error fetching statistics');
  }
};

// @desc    Toggle a vote on a complaint
// @route   POST /api/complaints/:id/vote
// @access  Private
exports.voteComplaint = async (req, res) => {
  try {
    const complaint = await loadComplaint(req, res);
    if (!complaint) return undefined;

    const alreadyVoted = complaint.votes.some(
      (vote) => vote.userId.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      complaint.votes = complaint.votes.filter(
        (vote) => vote.userId.toString() !== req.user._id.toString()
      );
    } else {
      complaint.votes.push({ userId: req.user._id });
    }

    await complaint.save();

    return ok(res, {
      message: alreadyVoted ? 'Vote removed' : 'Vote added',
      data: { voteCount: complaint.voteCount, hasVoted: !alreadyVoted }
    });
  } catch (error) {
    return handleError(res, error, 'Vote Complaint Error', 'Error voting on complaint');
  }
};
