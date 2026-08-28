// controllers/group/messageController.js
// The group message board. Only members can post; some groups restrict
// posting to admins.
const { created, forbidden, handleError } = require('../../utils/apiResponse');
const { loadGroup, contains } = require('./helpers');

// @desc    Post a message to a group
// @route   POST /api/groups/:id/messages
// @access  Private (members)
exports.addMessage = async (req, res) => {
  try {
    const group = await loadGroup(req, res);
    if (!group) return undefined;

    const isMember = contains(group.members, req.user._id);
    const isGroupAdmin = contains(group.admins, req.user._id);

    if (!isMember) {
      return forbidden(res, 'Only members can post messages. Please join the group first.');
    }

    if (group.settings.onlyAdminsCanPost && !isGroupAdmin) {
      return forbidden(res, 'Only admins can post in this group');
    }

    group.messages.push({
      userId: req.user._id,
      userName: req.user.name,
      message: req.body.message
    });

    await group.save();

    return created(res, {
      message: 'Message added successfully',
      data: group.messages[group.messages.length - 1]
    });
  } catch (error) {
    return handleError(res, error, 'Add Message Error', 'Error adding message');
  }
};
