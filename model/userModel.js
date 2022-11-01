const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, `The field 'name' is required!`]
    },
    email: {
        type: String,
        required: [true, `The field 'email' is required!`],
        validate: [validator.isEmail, 'Invalid email!'], 
        unique: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, `The field 'password' is required!`]
    },
    passwordConfirm: {
        type: String,
        minLength: 6,
        validate: {
            validator: function(item) {
                return item === this.password;
            },
            message: 'Passwords are not the same!'
        },
    
    },
    passwordCreatedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.isNew)
    {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.passwordCreatedAt = Date.now() - 1000;
    next();

})

userSchema.methods.isCorrectPassword = async function(password, encPassword) {
    return await bcrypt.compare(password, encPassword);
}


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordCreatedAt)
    {
        const changedTimestamp = parseInt(this.passwordCreatedAt.getTime() /1000 , 10);
        console.log(this.passwordCreatedAt+" "+JWTTimestamp);
        return JWTTimestamp < changedTimestamp ;
    }

    return false;
}

const User = mongoose.model('User', userSchema);

module.exports =  User;




