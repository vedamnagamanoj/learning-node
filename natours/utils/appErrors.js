class AppErrors extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // for example '404' then fail, if '500' then error
    this.isOperationalError = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppErrors;
