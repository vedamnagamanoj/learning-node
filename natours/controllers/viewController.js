const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppErrors = require('../utils/appErrors');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get all the tour data from the collection
  const tours = await Tour.find();
  // 2. Build the template
  // 3. render the template using the tour data from step 1
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get the data for the requested tour (including reviews and tour guides)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppErrors(404, 'There is no such tour'));
  }
  // 2. Build the template
  // 3. Render the tempalte using the data from step 1
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Login to your account' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your Account' });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res
    .status(200)
    .render('account', { title: 'Your Account', user: updatedUser });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // Find all bookings
  // const bookings = await Booking.find({ user: req.user.id });
  const bookings = await Booking.find({ user: req.user.id });

  // Find tours with the returned Id's

  // res.status(200).json({
  //   status: 'success',
  //   results: bookings.length,
  //   data: {
  //     bookings,
  //   },
  // });

  const tourIDs = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', { title: 'My Tours', tours });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successfull! Please check your email for confirmation. If your booking does't show up here immediately, please come back later.";

  next();
};
