// controllers/group/helpers.js
// Lookup and permission helpers shared by the group controllers.
const Group = require('../../models/Group');
const { notFound, forbidden } = require('../../utils/apiResponse');

// Answers the request and returns null when the group does not exist, so
// callers can bail out with `if (!group) return;`.
exports.loadGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    notFound(res, 'Group');
    return null;
  }
  return group;
};

const contains = (list, userId) =>
  list.some((entry) => (entry._id || entry).toString() === userId.toString());

exports.contains = contains;

// Group admin is per-group membership, not an application role, so it cannot
// be enforced by the `authorize` middleware.
exports.requireGroupAdmin = (req, res, group, message) => {
  if (!contains(group.admins, req.user._id)) {
    forbidden(res, message);
    return false;
  }
  return true;
};

// The membership flags the UI needs for the current viewer.
exports.membershipStatus = (group, userId) => {
  const isMember = contains(group.members, userId);
  const isPending = contains(group.pendingRequests, userId);
  const isGroupAdmin = contains(group.admins, userId);
  const isCreator = (group.creator._id || group.creator).toString() === userId.toString();

  return {
    isMember,
    isPending,
    isGroupAdmin,
    isCreator,
    canJoin: !isMember && !isPending,
    canViewMessages: isMember
  };
};
