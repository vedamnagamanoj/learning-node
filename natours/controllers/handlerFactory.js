const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new AppErrors(404, `Cannot find the document with that ID`));
    }

    res.status(204).json({
      status: 'success',
      message: 'Tour deleted successfully',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDocument) {
      return next(new AppErrors(404, 'Cannot find the document with that ID'));
    }

    res.status(200);
    res.json({
      status: 'success',
      data: {
        data: updatedDocument,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id).populate('reviews');

    if (!document) {
      return next(new AppErrors(404, 'Cannot find the document with that ID'));
    }

    res.status(200);
    res.json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201);
    res.json({ status: 'success', data: { data: newDocument } });
  });

// const deleteTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const deletedTour = await Tour.findByIdAndDelete(id);

//   if (!deletedTour) {
//     return next(new AppErrors(404, 'Cannot find the tour with that ID'));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Tour deleted successfully',
//   });
// });
