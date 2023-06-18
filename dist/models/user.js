"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const Pic = require('../models/profilePicture');
//==================================================
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        index: { unique: true },
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email format');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('password');
            }
        }
    },
    tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
    verificationToken: { type: String },
    verifiedEmail: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
//virtual tasks field for .populate()
schema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});
//virtual pic field for .populate()
schema.virtual('pic', {
    ref: 'Pic',
    localField: '_id',
    foreignField: 'owner',
    justOne: true
});
//login by credentials
schema.statics.findByCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    if (!user) {
        return null;
    }
    const isMatch = yield bcrypt.compare(password, user.password);
    if (!isMatch) {
        return null;
    }
    return user;
});
//filtering user data 
//toJSON retrieves the object the shape u want
schema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.verificationToken;
    delete userObject.verifiedEmail;
    return userObject;
};
//hashing password before use save()
schema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // isModified is provided by mongoose
        if (this.isModified('password')) {
            this.password = yield bcrypt.hash(this.password, 8);
        }
        next();
    });
});
//deleting tasks before a user is removed
schema.pre('remove', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Task.deleteMany({ owner: this._id });
        yield Pic.deleteOne({ owner: this._id });
        next();
    });
});
//authentication token generation
schema.methods.genAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jwt.sign({ _id: this._id.toString() }, process.env.JWT);
        this.tokens = this.tokens.concat({ token });
        yield this.save();
        return token;
    });
};
//token for E-mail verification
schema.methods.generateEmailToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jwt.sign({ _id: this._id.toString() }, process.env.JWT_VERIFY_ME, { expiresIn: '1h' });
        this.verificationToken = token;
        yield this.save();
        return token;
    });
};
schema.methods.generatePasswordToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jwt.sign({ _id: this._id.toString() }, process.env.JWT_VERIFY_ME_FOR_PASSWORD, { expiresIn: '1h' });
        this.verificationToken = token;
        yield this.save();
        return token;
    });
};
//===============================================================
const User = mongoose.model('User', schema);
module.exports = User;
