// controllers/rentalController.js
// Peer-to-peer rental listings in the marketplace.
const RentalItem = require('../models/RentalItem');
const { ok, created, notFound, forbidden, handleError } = require('../utils/apiResponse');

// Only these fields are client-editable. Anything else in the body
// (ownerId, views, ...) is ignored so an owner cannot reassign or inflate
// their listing.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'pricePerDay',
  'images',
  'condition',
  'available'
];

// @desc    Create rental item
// @route   POST /api/rentals
// @access  Private (Students only)
exports.createRentalItem = async (req, res) => {
  try {
    const { title, description, category, pricePerDay, images, condition } = req.body;

    const rentalItem = await RentalItem.create({
      title,
      description,
      category: category.toLowerCase(),
      pricePerDay,
      images: images || [],
      condition: condition || 'good',
      ownerId: req.user._id,
      ownerName: req.user.name,
      ownerRoom: req.user.roomNumber,
      ownerPhone: req.user.phoneNumber
    });

    return created(res, { data: rentalItem, message: 'Rental item created' });
  } catch (error) {
    return handleError(res, error, 'Create Rental Error', 'Error creating rental item');
  }
};

// @desc    Get all rental items
// @route   GET /api/rentals
// @access  Private
exports.getRentalItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    const query = {};

    if (category) query.category = category.toLowerCase();
    if (available !== undefined) query.available = available === 'true';

    const items = await RentalItem.find(query)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name roomNumber');

    return ok(res, { data: items, meta: { count: items.length } });
  } catch (error) {
    return handleError(res, error, 'Get Rentals Error', 'Error fetching rental items');
  }
};

// @desc    Get single rental item
// @route   GET /api/rentals/:id
// @access  Private
exports.getRentalItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id).populate(
      'ownerId',
      'name roomNumber phoneNumber email'
    );

    if (!item) return notFound(res, 'Rental item');

    item.views += 1;
    await item.save();

    return ok(res, { data: item });
  } catch (error) {
    return handleError(res, error, 'Get Rental Error', 'Error fetching rental item');
  }
};

// @desc    Update rental item
// @route   PUT /api/rentals/:id
// @access  Private (Owner only)
exports.updateRentalItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id);

    if (!item) return notFound(res, 'Rental item');

    if (item.ownerId.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Not authorized to update this item');
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.category) {
      updates.category = updates.category.toLowerCase();
    }

    const updated = await RentalItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    return ok(res, { data: updated, message: 'Rental item updated' });
  } catch (error) {
    return handleError(res, error, 'Update Rental Error', 'Error updating rental item');
  }
};

// @desc    Delete rental item
// @route   DELETE /api/rentals/:id
// @access  Private (Owner only)
exports.deleteRentalItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id);

    if (!item) return notFound(res, 'Rental item');

    if (item.ownerId.toString() !== req.user._id.toString()) {
      return forbidden(res, 'Not authorized to delete this item');
    }

    await item.deleteOne();

    return ok(res, { message: 'Rental item deleted' });
  } catch (error) {
    return handleError(res, error, 'Delete Rental Error', 'Error deleting rental item');
  }
};

// @desc    Toggle interest in a rental item
// @route   POST /api/rentals/:id/interest
// @access  Private
exports.markInterest = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.id);

    if (!item) return notFound(res, 'Rental item');

    const alreadyInterested = item.interestedUsers.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyInterested) {
      item.interestedUsers = item.interestedUsers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      item.interestedUsers.push(req.user._id);
    }

    await item.save();

    return ok(res, {
      data: { interested: !alreadyInterested, count: item.interestedUsers.length }
    });
  } catch (error) {
    return handleError(res, error, 'Mark Interest Error', 'Error marking interest');
  }
};
