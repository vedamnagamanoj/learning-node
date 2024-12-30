const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// Users
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
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
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'updateUser route not defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'deleteUser route not defined',
  });
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  deleteUser,
  updateUser,
};
