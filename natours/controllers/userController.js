const User = require('../models/userModel');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  console.log(newObj);
  return newObj;
};

// Users
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // const users = await User.find({ active: { $ne: false } });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  // 1. create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppErrors(
        400,
        'Cannot change password with this route, please use /updatePassword',
      ),
    );
  // 2. filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3. update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'createUser route not defined',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'getUser route not defined',
  });
};

// Do NOT update password with this
const updateUser = handlerFactory.updateOne(User);
const deleteUser = handlerFactory.deleteOne(User);

module.exports = {
  getAllUsers,
  createUser,
  updateMe,
  deleteMe,
  getUser,
  deleteUser,
  updateUser,
};
