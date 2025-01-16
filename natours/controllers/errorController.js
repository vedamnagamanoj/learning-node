const AppErrors = require('../utils/appErrors');

const handleCastErrorDB = (err) =>
  new AppErrors(400, `Invalid ${err.path}: ${err.value}`);
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmessage.match(/"(.*?)"/)[0];
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

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) Rendered Website for user
  console.error('ERROR 💥', err);
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong!', msg: err.message });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperationalError) {
      // console.log(err);
      // Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //  Programming or other unknown error: don't leak error details
    // 1. Log the error
    // 2. Send a generic message
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // for rendered website for user
  if (err.isOperationalError) {
    return res.status(err.statusCode).render('error', {
      title: 'Please try again later',
      msg: `${err.message} + hi`,
    });
  }
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
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
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // sendErrorProd(err, res);
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
