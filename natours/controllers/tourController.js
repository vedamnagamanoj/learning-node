// const fs = require('fs');
const Tour = require('../models/tourModel');
const handlerFactory = require('./handlerFactory');
const ApiFeatures = require('../utils/apiFeatures');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');

// const simpleTourData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
// );

// const checkId = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   console.log(req.requestTime);
//   if (+req.params.id > 'tours'.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Could not delete the tour',
//     });
//   }
//   next();
// };

// const checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'This is a bad request without name or price',
//     });
//   }
//   next();
// };

// For Tours

// middleware
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = catchAsync(async (req, res, next) => {
  // console.log(Tour.find(), req.query);
  // Execute the query
  // console.log(req.query);
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // const query = Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  // Send response
  res.status(200);
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // const tour = await Tour.findOne({ _id: id });
  const tour = await Tour.findById(id).populate('reviews');
  // const tour = await Tour.findById(id).populate({
  //   path: 'guides',
  //   select: '-__v -passwordChangedAt',
  // }); // populates the "guides" field with data from users by id
  // const tour = await Tour.find({ name: 'The Park Camper' });

  if (!tour) {
    return next(new AppErrors(404, 'Cannot find the tour with that ID'));
  }

  res.status(200);
  res.json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const createTour = handlerFactory.createOne(Tour);
const updateTour = handlerFactory.updateOne(Tour);
const deleteTour = handlerFactory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

// const months = [
//   'January',
//   'Feburary',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: `$_id` },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  // getCandB,
};
