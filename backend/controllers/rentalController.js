// controllers/rentalController.js
const RentalItem = require('../models/RentalItem');
const exposeError = require('../utils/exposeError');

// @desc    Create rental item
// @route   POST /api/rentals
// @access  Private (Students only)
exports.createRentalItem = async (req, res) => {
  try {
    const { title, description, category, pricePerDay, images, condition } = req.body;

    const rentalItem = await RentalItem.create({
      title,
      description,
      category: category.toLowerCase(), // Convert to lowercase to match enum
      pricePerDay,
      images: images || [],
      condition: condition || 'good',
      ownerId: req.user._id,
      ownerName: req.user.name,
      ownerRoom: req.user.roomNumber,
      ownerPhone: req.user.phoneNumber
    });

    res.status(201).json({
      success: true,
      data: rentalItem
    });
  } catch (error) {
    console.error('Create Rental Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating rental item',
      error: exposeError(error)
    });
  }
};

// @desc    Get all rental items
// @route   GET /api/rentals
// @access  Private
exports.getRentalItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    let query = {};

    if (category) query.category = category.toLowerCase(); // Convert to lowercase
    if (available !== undefined) query.available = available === 'true';

    const items = await RentalItem.find(query)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name roomNumber');

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Get Rentals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rental items'
    });
  }
};

// @desc    Get single rental item
// @route   GET /api/rentals/:id
// @access  Private
exports.getRentalItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id)
      .populate('ownerId', 'name roomNumber phoneNumber email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Rental item not found'
      });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get Rental Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rental item'
    });
  }
};

// @desc    Update rental item
// @route   PUT /api/rentals/:id
// @access  Private (Owner only)
exports.updateRentalItem = async (req, res) => {
  try {
    let item = await RentalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Rental item not found'
      });
    }

    // Check ownership
    if (item.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Only these fields are client-editable. Anything else in the body
    // (ownerId, views, ...) is ignored so an owner cannot reassign or
    // inflate the listing.
    const EDITABLE_FIELDS = [
      'title',
      'description',
      'category',
      'pricePerDay',
      'images',
      'condition',
      'available'
    ];

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.category) {
      updates.category = updates.category.toLowerCase();
    }

    item = await RentalItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Update Rental Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating rental item'
    });
  }
};

// @desc    Delete rental item
// @route   DELETE /api/rentals/:id
// @access  Private (Owner only)
exports.deleteRentalItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Rental item not found'
      });
    }

    // Check ownership
    if (item.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Rental item deleted'
    });
  } catch (error) {
    console.error('Delete Rental Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rental item'
    });
  }
};

// @desc    Mark interest in rental item
// @route   POST /api/rentals/:id/interest
// @access  Private
exports.markInterest = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Rental item not found'
      });
    }

    const alreadyInterested = item.interestedUsers.includes(req.user._id);

    if (alreadyInterested) {
      item.interestedUsers = item.interestedUsers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      item.interestedUsers.push(req.user._id);
    }

    await item.save();

    res.json({
      success: true,
      interested: !alreadyInterested,
      count: item.interestedUsers.length
    });
  } catch (error) {
    console.error('Mark Interest Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking interest'
    });
  }
};