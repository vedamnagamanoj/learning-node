const fs = require('fs');

const simpleTourData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

const checkId = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  console.log(req.requestTime);
  if (+req.params.id > simpleTourData.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Could not delete the tour',
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'This is a bad request without name or price',
    });
  }
  next();
};

// For Tours
const getAllTours = (req, res) => {
  res.status(200);
  res.json({
    status: 'success',
    results: simpleTourData.length,
    data: { tours: simpleTourData },
  });
};

const getTour = (req, res) => {
  const { id } = req.params;
  const data = simpleTourData.find((el) => el.id === +id);

  res.status(200);
  res.json({
    status: 'success',
    data: {
      tour: data,
    },
  });
};

const createTour = (req, res) => {
  const newId = simpleTourData.at(-1).id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  simpleTourData.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(simpleTourData),
    (err) => {
      res.status(201);
      res.json({ status: 'success', data: { tour: newTour } });
    }
  );
};

const updateTour = (req, res) => {
  res.status(200);
  res.json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

module.exports = {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  checkId,
  checkBody,
};
