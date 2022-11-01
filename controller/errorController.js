const { CustomError } = require("../uitls");

module.exports = (err, req, res, next) => {
    console.log(err)
    if (err.code === 11000)
    {
        err = new CustomError('This email is already existed!', 400);
    }
    else if (err.name === 'ValidationError')
    {
        let errorMessages = Object.values(err.errors).map(item => item.message);
        err = new CustomError(errorMessages.join(' '), 400);
    }
    else if( err.name === 'JsonWebTokenError')
    {
        err = new CustomError('Invalid jwt token!', 400);
    }

    if (err && err.isOperational)
    {
        // console.log(error);
        res.status(err.statusCode).json({ 
            status: err.status,
            message: err.message,
        });
    }
    else 
    {
        console.log('Uncatch Error !! ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }

}