const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppErrors = require('../utils/appErrors');

const signToken = (id) =>
  jwt.sign(
    { id, code: 'Dammunte Pattuko ra Shekawat' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
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
  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new AppErrors(401, 'The user belonging to this token no longer exists'),
    );

  // 4. Check if user changed password after the token was issued
  freshUser.changedPasswordAfter(decoded.iat);

  next();
});