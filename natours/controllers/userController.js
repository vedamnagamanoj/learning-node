const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppErrors = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

// const multerStroage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/').at(-1);
//     // user-id-timestamp.jpeg
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStroage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppErrors(404, 'Not an image! Please upload only images'), false);
  }
};

const upload = multer({ storage: multerStroage, fileFilter: multerFilter });

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  // console.log(newObj);
  return newObj;
};

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
// Users

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1. create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppErrors(
        400,
        'Cannot change password with this route, please use /updatePassword',
      ),
    );
  // 2. filtered out unwanted field names that are not allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');
  if (req.file) filteredBody.photo = req.file.filename;
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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'createUser route not defined! Please use /signup instead',
  });
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
// Do NOT update password with this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
