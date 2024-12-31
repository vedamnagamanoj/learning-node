const AppErrors = require('../utils/appErrors');

const handleCastErrorDB = (err) =>
  new AppErrors(400, `Invalid ${err.path}: ${err.value}`);
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/"(.*?)"/)[0];
  // console.log(value);
  return new AppErrors(
    400,
    `Duplicate Field Value: ${value}. Please use another value!`,
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  return new AppErrors(400, `Invalid input data. ${errors.join('. ')}`);
};

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorProd = (err, res) => {
  // console.log(err);
  // Operational, trusted error: send message to client
  if (err.isOperationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //  Programming or other unknown error: don't leak error details
    // 1. Log the error
    console.error('ERROR 💥', err);

    // 2. Send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const handleJWTError = () =>
  new AppErrors(401, 'Invalid token. Please log in again');

const handleJWTExpiredError = () =>
  new AppErrors(401, 'Your token has expired, please login again');

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; // default: internal server error
  err.status = err.status || 'error';

  // console.log(err);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // sendErrorProd(err, res);
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
