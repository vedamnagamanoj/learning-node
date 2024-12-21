// Users
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'getAllUsers route not defined',
  });
};

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
