const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppErrors = require('../utils/appErrors');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign(
    { id, code: 'Dammunte Pattuko ra Shekawat' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

const createSentToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ), // converting to milli seconds
    // secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // removes password from the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   role: req.body.role,
  // });

  createSentToken(newUser, 201, res);

  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. chech if email and password actually exists
  if (!email || !password) {
    return next(new AppErrors(400, 'Please provide email and password please'));
  }
  // 2. check if the user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrors(401, 'Incorrect email or password'));
  }
  // 3. if everthing is okay, then send JWT to the client
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });

  createSentToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(-1);
  }
  if (!token)
    return next(
      new AppErrors(401, 'You are not logged in! Please log in to get access'),
    );
  // 2. Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppErrors(401, 'The user belonging to this token no longer exists'),
    );

  // 4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppErrors(
        401,
        'The user has changed the password, please login and try again',
      ),
    );
  }

  // Grants access to protected routes
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrors(
          403,
          'You do not have permission to perform this action.',
        ),
      );
    }
    // roles ['admin', 'lead-guide']. role = 'user'
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppErrors(404, 'There is no user with provided email address.'),
    );
  // 2. generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3. send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppErrors(
        500,
        'There was and error sending the email. Try again later',
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the password token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppErrors(400, 'Token is invalid or has expired'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // here we do not turn off validators because we need to validate the password with confirm password
  // update changedPassword property for the user

  // log the user in , send JWT

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });

  createSentToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  // 2. check if the POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppErrors(401, 'Your current password is wrong'));
  // 3.  If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // User.findByIdAndUpdate will Not work as intended!
  // 4. Log user in, send JWT

  createSentToken(user, 200, res);
});
