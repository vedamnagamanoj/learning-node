const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use((req, res, next) => {
  console.log(
    '----------------------------------------------------------------------------------------------------------------------------------------------------------------------',
  );
  console.log(x);
  next();
});
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleDateString();
  next();
});

// Mounting routers

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// for all remaing unhandled/unspecified routes and the order of defining the below code matters, it should be at the end of all the routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Can't find ${req.originalUrl} on this server! `,
  // });
  //                         OR
  // const err = new Error(`Can't find ${req.originalUrl} on this server! `);
  // err.status = 'fail';
  // err.statusCode = 404;

  //                         OR

  next(new AppError(404, `Can't find ${req.originalUrl} on this server! `));
});

app.use(globalErrorHandler);

module.exports = app;
