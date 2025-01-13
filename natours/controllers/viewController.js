const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get all the tour data from the collection
  const tours = await Tour.find();
  // 2. Build the template
  // 3. render the template using the tour data from step 1
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', { title: 'Detailed tour view' });
};
