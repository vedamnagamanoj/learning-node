const DEFAULT_PAGE = 1;
const PAGE_LIMIT = 10;

module.exports = class {
  // query = Tour.find()
  // queryObj = res.query object
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    // 1a. basic filtering
    const tempQueryObj = { ...this.queryObj };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((el) => delete tempQueryObj[el]);

    // 1b. adv filtering
    const queryStr = JSON.stringify(tempQueryObj).replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedStr) => `$${matchedStr}`,
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2. sorting
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // minus sign '-' is used to sort by descending order
    }
    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      // const fields = req.query.fields.replaceAll(',', ' ');
      const fields = this.queryObj.fields.split(',').join(' ');
      // query = query.select('name duration price difficulty')
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryObj.page || DEFAULT_PAGE;
    const limit = +this.queryObj.limit || PAGE_LIMIT;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    // No need
    // if (this.queryObj.page) {
    //   const numTours = this.queryObj.data.tours.length();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }
    return this;
  }
};
