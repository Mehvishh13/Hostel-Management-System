// backend/routes/rentals.js
const express = require('express');
const {
  createRentalItem,
  getRentalItems,
  getRentalItem,
  updateRentalItem,
  deleteRentalItem,
  markInterest
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createRentalSchema, updateRentalSchema } = require('../middleware/schemas');

const router = express.Router();

router.route('/')
  .get(protect, getRentalItems)
  .post(protect, authorize('student'), validate(createRentalSchema), createRentalItem);

router.route('/:id')
  .get(protect, getRentalItem)
  .put(protect, validate(updateRentalSchema), updateRentalItem)
  .delete(protect, deleteRentalItem);

router.route('/:id/interest')
  .post(protect, markInterest);

module.exports = router;
