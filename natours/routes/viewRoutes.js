const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/bookings', authController.protect, viewController.getMyBookings);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

module.exports = router;
