// controllers/group/membershipController.js
// Joining, leaving and the admin side of membership management.
const { ok, fail, forbidden, handleError } = require('../../utils/apiResponse');
const { loadGroup, contains, requireGroupAdmin } = require('./helpers');

// @desc    Join a group, or request to join when approval is required
// @route   POST /api/groups/:id/join
// @access  Private
exports.joinGroup = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (contains(group.members, req.user._id)) {
      return fail(res, 400, 'You are already a member of this group');
    }

    if (contains(group.pendingRequests, req.user._id)) {
      return fail(res, 400, 'Your join request is already pending');
    }

    if (group.settings.requireApproval) {
      group.pendingRequests.push(req.user._id);
      await group.save();

      return ok(res, {
        message: 'Join request sent. Waiting for admin approval.',
        data: { pending: true }
      });
    }

    group.members.push(req.user._id);
    await group.save();

    return ok(res, {
      message: 'Successfully joined the group!',
      data: { pending: false, group }
    });
  } catch (error) {
    return handleError(res, error, 'Join Group Error', 'Error joining group');
  }
};

// @desc    Cancel own pending join request
// @route   POST /api/groups/:id/cancel-request
// @access  Private
exports.cancelRequest = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    group.pendingRequests = group.pendingRequests.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await group.save();

    return ok(res, { message: 'Join request cancelled' });
  } catch (error) {
    return handleError(res, error, 'Cancel Request Error', 'Error cancelling request');
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (group.creator.toString() === req.user._id.toString()) {
      return fail(res, 400, 'Group creator cannot leave. Delete the group instead.');
    }

    group.members = group.members.filter((m) => m.toString() !== req.user._id.toString());
    group.admins = group.admins.filter((a) => a.toString() !== req.user._id.toString());

    await group.save();

    return ok(res, { message: 'Left group successfully' });
  } catch (error) {
    return handleError(res, error, 'Leave Group Error', 'Error leaving group');
  }
};

// @desc    Promote a member to group admin
// @route   POST /api/groups/:id/make-admin/:userId
// @access  Private (group admins)
exports.makeAdmin = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (!requireGroupAdmin(req, res, group, 'Only group admins can make others admin')) {
      return undefined;
    }

    if (!contains(group.members, req.params.userId)) {
      return fail(res, 400, 'User is not a member of this group');
    }

    if (!contains(group.admins, req.params.userId)) {
      group.admins.push(req.params.userId);
      await group.save();
    }

    return ok(res, { message: 'User made admin successfully' });
  } catch (error) {
    return handleError(res, error, 'Make Admin Error', 'Error making user admin');
  }
};

// @desc    Remove a member from the group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (group admins)
exports.removeMember = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (!requireGroupAdmin(req, res, group, 'Only group admins can remove members')) {
      return undefined;
    }

    if (group.creator.toString() === req.params.userId) {
      return fail(res, 400, 'Cannot remove group creator');
    }

    group.members = group.members.filter((m) => m.toString() !== req.params.userId);
    group.admins = group.admins.filter((a) => a.toString() !== req.params.userId);

    await group.save();

    return ok(res, { message: 'Member removed successfully' });
  } catch (error) {
    return handleError(res, error, 'Remove Member Error', 'Error removing member');
  }
};

// @desc    Approve a pending join request
// @route   POST /api/groups/:id/approve/:userId
// @access  Private (group admins)
exports.approveRequest = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (!requireGroupAdmin(req, res, group, 'Only group admins can approve requests')) {
      return undefined;
    }

    group.pendingRequests = group.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );

    if (!contains(group.members, req.params.userId)) {
      group.members.push(req.params.userId);
    }

    await group.save();

    return ok(res, { message: 'Request approved successfully' });
  } catch (error) {
    return handleError(res, error, 'Approve Request Error', 'Error approving request');
  }
};

// @desc    Reject a pending join request
// @route   POST /api/groups/:id/reject/:userId
// @access  Private (group admins)
exports.rejectRequest = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    if (!requireGroupAdmin(req, res, group, 'Only group admins can reject requests')) {
      return undefined;
    }

    group.pendingRequests = group.pendingRequests.filter(
      (id) => id.toString() !== req.params.userId
    );

    await group.save();

    return ok(res, { message: 'Request rejected successfully' });
  } catch (error) {
    return handleError(res, error, 'Reject Request Error', 'Error rejecting request');
  }
};
