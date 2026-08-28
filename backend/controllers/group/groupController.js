// controllers/group/groupController.js
// Group lifecycle: create, list, read, update, delete.
// Membership and messaging live in sibling modules.
const Group = require('../../models/Group');
const { ok, created, notFound, forbidden, handleError } = require('../../utils/apiResponse');
const { loadGroup, requireGroupAdmin, membershipStatus } = require('./helpers');

// @desc    Create group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, privacy, image, settings } = req.body;

    const group = await Group.create({
      name,
      description,
      category: category || 'general',
      privacy: privacy || 'public',
      image: image || '',
      settings: settings || {},
      creator: req.user._id,
      admins: [req.user._id],
      members: [req.user._id]
    });

    return created(res, { data: group, message: 'Group created' });
  } catch (error) {
    return handleError(res, error, 'Create Group Error', 'Error creating group');
  }
};

// @desc    Get all groups, each annotated with the viewer's membership
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    // Students see every group. Admins and wardens do not see groups that
    // explicitly opted out of hostel-staff visibility.
    const query =
      req.user.role === 'admin' || req.user.role === 'warden'
        ? { 'settings.hiddenFromHostelAdmin': { $ne: true } }
        : {};

    const groups = await Group.find(query)
      .populate('creator', 'name')
      .populate('admins', 'name')
      .sort({ updatedAt: -1 });

    const data = groups.map((group) => ({
      ...group.toObject(),
      userStatus: membershipStatus(group, req.user._id)
    }));

    return ok(res, { data, meta: { count: data.length } });
  } catch (error) {
    return handleError(res, error, 'Get Groups Error', 'Error fetching groups');
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name roomNumber')
      .populate('admins', 'name roomNumber')
      .populate('members', 'name roomNumber')
      .populate('pendingRequests', 'name roomNumber');

    if (!group) return notFound(res, 'Group');

    return ok(res, {
      data: group,
      meta: { userStatus: membershipStatus(group, req.user._id) }
    });
  } catch (error) {
    return handleError(res, error, 'Get Group Error', 'Error fetching group');
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (group admins)
exports.updateGroup = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (!requireGroupAdmin(req, res, group, 'Only group admins can update the group')) {
      return undefined;
    }

    // Membership, admins, creator and messages are changed through their own
    // endpoints, which carry their own authorization checks.
    const EDITABLE_FIELDS = ['name', 'description', 'category', 'image', 'privacy', 'settings'];

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Group.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    return ok(res, { data: updated, message: 'Group updated' });
  } catch (error) {
    return handleError(res, error, 'Update Group Error', 'Error updating group');
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (creator only)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (group.creator.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Only the group creator can delete the group');
    }

    await group.deleteOne();

    return ok(res, { message: 'Group deleted successfully' });
  } catch (error) {
    return handleError(res, error, 'Delete Group Error', 'Error deleting group');
  }
};
