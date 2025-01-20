const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appErrors');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const bookingController = require('./controllers/bookingController');

const app = express();
app.enable('trust proxy');

// defining the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// // Global Middlewares
// Implement CORS
app.use(cors());
// sets "Access-Control-Allow-Origin" header to *(everything)
// if we have our api at "api.natours.com" and our frontend app on natours.com we can set
// but this will work only for simple requests (GET & POST)
// app.use(cors({
// origin: 'https://www.natours.com',
// }));
// for DELETE, PUT, PATCH request we should also use "options"
app.options('*', cors());
// allowing only specific route
// app.options('/api/v1/tours/:id', cors());

// set security HTTP headers
app.use(helmet());

// // Custom CSP settings with helmet
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'https://unpkg.com'],
//       styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
//       // Add other directives as needed
//     },
//   }),
// );

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests form this IP, please try again in an hour!',
});
app.use('/api', limiter);

// we need the response coming from the stripe in STREAM form, because in booking router we would have parsed the data to JSON using the express middleware
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); // body larger than 10kb will not be accepted
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
// used for text compression
app.use(compression());

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleDateString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// Mounting routers

app.use('/', viewRouter);
// if we want to implement CORS on a specific item
// app.use('/api/v1/tours', cors(), tourRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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

// Considerations

// For API side
// 1. Implement restriction that users can only review a tour that they have actually booked.
// 2. Implement nested booking routes /tours/:id/bookings and /users/:id/bookings
// 3. Improve tour dates: add a participants and a soldOut field to each date. A date then becomes like an instance of the tour. Then, when a user books, they need to select one of the dates. A new booking will increase the number of participants in the data, until it is booked out (participants > maxGroupSize). So, when a user wants to book, you need to check if tour on the selected date is still available.
// 4. Implement advanced authenticated features: confirm user email, keep users logged in with refresh tokens, two-factor authentication, etc.

// For website
// 1. Implement a sign up form, similar to the login form
// On the tour detail page, if a user has taken a tour, allow them add a review directly on the website. Implement a form for this.
// Hide the entire booking section on the tour detail page if current user has already booked the tour (also prevent duplicate bookings on the model)
// Implement "like tour" functionality, with favoutite tour page
// On the user account page, implement  the 'My Reviews' page, where all reviews are displayed, and a user can edit them. ( If you know React, this would be an amazing way to use the Natours API and train your skills!)
// For administrators, implement all the "Manage" pages, where they can CRUD (create, read, update, delete) tours, users, reviews, and bookings
