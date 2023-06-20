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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcrypt = require('bcryptjs');
const mongoose_1 = __importDefault(require("mongoose"));
const validator = require('validator');
const jwt = require('jsonwebtoken');
//==================================================
const schema = new mongoose_1.default.Schema({
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
    contacts: [{
            contactName: {
                type: String
            },
            contactId: {
                type: mongoose_1.default.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            roomId: {
                type: mongoose_1.default.Types.ObjectId,
                required: true,
                ref: 'RoomOneToOne'
            }
        }],
    connectRequests: [{
            userName: {
                type: String
            },
            user_Id: {
                type: String
            }
        }]
}, {
    timestamps: true
});
//login by credentials
schema.statics.findByCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield exports.User.findOne({ email });
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
exports.User = mongoose_1.default.model('User', schema);
