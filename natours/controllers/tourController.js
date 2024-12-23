const fs = require('fs');
const Tour = require('../models/tourModel');

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

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200);
    res.json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(400);
    res.json({
      status: 'failed',
      message: 'Cannot access the tour data',
    });
  }
};

const getTour = async (req, res) => {
  try {
    const { id } = req.params;
    // const tour = await Tour.findOne({ _id: id });
    const tour = await Tour.findById(id);
    // const tour = await Tour.find({ name: 'The Park Camper' });

    if (!tour) throw new Error('Cannot find the tour');

    res.status(200);
    res.json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const createTour = async (req, res) => {
  // const newId = tours.at(-1).id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  // (err) => {

  try {
    const newTour = await Tour.create(req.body);

    res.status(201);
    res.json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400);
    res.json({
      status: 'failed',
      message: err,
    });
  }
  // },
  // );
};

const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200);
    res.json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
      message: 'Tour deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

module.exports = {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
};
