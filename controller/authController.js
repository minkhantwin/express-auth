const jwt = require("jsonwebtoken");
const {promisify}  = require('util');
const User = require("../model/userModel");
const { catchAsync, CustomError } = require("../uitls");

exports.createUser = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })


});

exports.findAll = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password)
    {
        return next(new CustomError('Provide both email and password!', 400));
    }

    const user = await User.findOne({ email })  

    if (!user || !(await user.isCorrectPassword(password, user.password)))
    {
        return next(new CustomError('Email or Password is incorrect!', 403));  
    }

    const token = jwtSign(user._id);
    res.status(200).json({ 
        status: 'success',
        token 
    });

});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if( req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1];
        }
    // check if token is present in the header
    if(!token)
    {
        return next(new CustomError('JWT token is required!', 401));
    }

    // token verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser)
    {
        return next(new CustomError('The user belonging to this token no longer exist.',401));
    }

    // check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new CustomError('The user changed password after token is created',401));
    }

    req.user = freshUser;

    next();
})


const jwtSign = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN})
}

