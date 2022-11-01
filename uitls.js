exports.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    }
  
  };


exports.CustomError = class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);

    }
}

