const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour name must have atleast 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain alphabet characters',
      // ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 2.5,
      max: [5, 'A tour should have a maximum rating of 5'],
      min: [1, 'A tour must have a minimum rating of 1'],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator(val) {
          // this only points to current doc on NEW document creation not on UPDATE validation
          return this.price > val;
        },
        message: 'Discount: {VALUE} should be less than the tour price',
      },
    },
    summary: {
      type: String,
      trim: true, // removes whitespaces in begining and in the end
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date], // doesnot create automatically, we can send dates like '2021-03-21,11:31' and mongo will parse it
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON to represent geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); "1": axcending "-1": descending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('testing').get(function () {
  return `Testing an virtual populate by ${this.name}`;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour', // name of the field in child where the id is stored
});

tourSchema.virtual('user', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
});

// Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// connecting tour guides by reference
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log(this);
//   console.log('Will save document...');
//   next();
// });
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// Query MIDDLEWARe

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // here this represents the current query in the query middleware
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

// Aggregation MIDDLEWARE
// this points to the current aggregation object
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());

//   next();
// });

module.exports = mongoose.model('Tour', tourSchema);
