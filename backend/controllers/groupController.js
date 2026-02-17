// controllers/groupController.js
const Group = require('../models/Group');

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

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Create Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};

// @desc    Get all groups (ALL STUDENTS CAN SEE ALL GROUPS)
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    let query = {};

    // ALL STUDENTS CAN NOW SEE ALL GROUPS
    // Only filter out groups hidden from hostel admin if user is admin/warden
    if (req.user.role === 'admin' || req.user.role === 'warden') {
      query = { 'settings.hiddenFromHostelAdmin': { $ne: true } };
    }
    // Students see all groups (no restrictions)

    const groups = await Group.find(query)
      .populate('creator', 'name')
      .populate('admins', 'name')
      .sort({ updatedAt: -1 });

    // Add membership status for each group
    const groupsWithStatus = groups.map(group => {
      const groupObj = group.toObject();
      const isMember = group.members.some(m => m.toString() === req.user._id.toString());
      const isPending = group.pendingRequests.some(r => r.toString() === req.user._id.toString());
      const isAdmin = group.admins.some(a => a.toString() === req.user._id.toString());
      const isCreator = group.creator._id.toString() === req.user._id.toString();

      return {
        ...groupObj,
        userStatus: {
          isMember,
          isPending,
          isAdmin,
          isCreator,
          canJoin: !isMember && !isPending // Can join if not a member and not pending
        }
      };
    });

    res.json({
      success: true,
      count: groupsWithStatus.length,
      data: groupsWithStatus
    });
  } catch (error) {
    console.error('Get Groups Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups'
    });
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

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // ALL STUDENTS CAN NOW VIEW ANY GROUP DETAILS
    const isMember = group.members.some(m => m._id.toString() === req.user._id.toString());
    const isPending = group.pendingRequests.some(r => r._id.toString() === req.user._id.toString());
    const isGroupAdmin = group.admins.some(a => a._id.toString() === req.user._id.toString());
    const isCreator = group.creator._id.toString() === req.user._id.toString();

    res.json({
      success: true,
      data: group,
      userRole: {
        isMember,
        isPending,
        isGroupAdmin,
        isCreator,
        canJoin: !isMember && !isPending,
        canViewMessages: isMember // Only members can see messages
      }
    });
  } catch (error) {
    console.error('Get Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group'
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (Group Admins only)
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is group admin
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can update the group'
      });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Update Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating group'
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (Creator only)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Only creator can delete
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can delete the group'
      });
    }

    await group.deleteOne();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting group'
    });
  }
};

// @desc    Join group (IMPROVED - Students can join any group)
// @route   POST /api/groups/:id/join
// @access  Private
exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check if already pending
    const isPending = group.pendingRequests.some(r => r.toString() === req.user._id.toString());

    if (isPending) {
      return res.status(400).json({
        success: false,
        message: 'Your join request is already pending'
      });
    }

    // If requires approval, add to pending
    if (group.settings.requireApproval) {
      group.pendingRequests.push(req.user._id);
      await group.save();

      return res.json({
        success: true,
        message: 'Join request sent. Waiting for admin approval.',
        pending: true
      });
    }

    // Otherwise, add directly to members
    group.members.push(req.user._id);
    await group.save();

    res.json({
      success: true,
      message: 'Successfully joined the group!',
      data: group
    });
  } catch (error) {
    console.error('Join Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining group'
    });
  }
};

// @desc    Cancel join request
// @route   POST /api/groups/:id/cancel-request
// @access  Private
exports.cancelRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Remove from pending requests
    group.pendingRequests = group.pendingRequests.filter(
      id => id.toString() !== req.user._id.toString()
    );
    
    await group.save();

    res.json({
      success: true,
      message: 'Join request cancelled'
    });
  } catch (error) {
    console.error('Cancel Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request'
    });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Can't leave if you're the creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Group creator cannot leave. Delete the group instead.'
      });
    }

    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    group.admins = group.admins.filter(a => a.toString() !== req.user._id.toString());
    
    await group.save();

    res.json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Leave Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving group'
    });
  }
};

// @desc    Make member admin
// @route   POST /api/groups/:id/make-admin/:userId
// @access  Private (Group Admins only)
exports.makeAdmin = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is group admin
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can make others admin'
      });
    }

    // Check if user is a member
    if (!group.members.some(m => m.toString() === req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }

    // Add to admins if not already
    if (!group.admins.some(a => a.toString() === req.params.userId)) {
      group.admins.push(req.params.userId);
      await group.save();
    }

    res.json({
      success: true,
      message: 'User made admin successfully'
    });
  } catch (error) {
    console.error('Make Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error making user admin'
    });
  }
};

// @desc    Remove member
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (Group Admins only)
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is group admin
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can remove members'
      });
    }

    // Can't remove creator
    if (group.creator.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group creator'
      });
    }

    group.members = group.members.filter(m => m.toString() !== req.params.userId);
    group.admins = group.admins.filter(a => a.toString() !== req.params.userId);
    
    await group.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member'
    });
  }
};

// @desc    Add message to group (ONLY MEMBERS CAN POST)
// @route   POST /api/groups/:id/messages
// @access  Private (Members only)
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if member
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Only members can post messages. Please join the group first.'
      });
    }

    // Check if only admins can post
    if (group.settings.onlyAdminsCanPost && !isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can post in this group'
      });
    }

    group.messages.push({
      userId: req.user._id,
      userName: req.user.name,
      message
    });

    await group.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      data: group.messages[group.messages.length - 1]
    });
  } catch (error) {
    console.error('Add Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message'
    });
  }
};

// @desc    Approve join request
// @route   POST /api/groups/:id/approve/:userId
// @access  Private (Group Admins only)
exports.approveRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is group admin
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can approve requests'
      });
    }

    // Remove from pending and add to members
    group.pendingRequests = group.pendingRequests.filter(
      id => id.toString() !== req.params.userId
    );
    
    if (!group.members.some(m => m.toString() === req.params.userId)) {
      group.members.push(req.params.userId);
    }

    await group.save();

    res.json({
      success: true,
      message: 'Request approved successfully'
    });
  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving request'
    });
  }
};

// @desc    Reject join request
// @route   POST /api/groups/:id/reject/:userId
// @access  Private (Group Admins only)
exports.rejectRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if requester is group admin
    const isGroupAdmin = group.admins.some(a => a.toString() === req.user._id.toString());

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can reject requests'
      });
    }

    // Remove from pending
    group.pendingRequests = group.pendingRequests.filter(
      id => id.toString() !== req.params.userId
    );
    
    await group.save();

    res.json({
      success: true,
      message: 'Request rejected successfully'
    });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request'
    });
  }
};