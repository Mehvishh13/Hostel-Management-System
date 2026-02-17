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

const router = express.Router();

router.route('/')
  .get(protect, getRentalItems)
  .post(protect, authorize('student'), createRentalItem);

router.route('/:id')
  .get(protect, getRentalItem)
  .put(protect, updateRentalItem)
  .delete(protect, deleteRentalItem);

router.route('/:id/interest')
  .post(protect, markInterest);

module.exports = router;
