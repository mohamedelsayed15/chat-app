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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtVerify = exports.auth = void 0;
const jwt = require('jsonwebtoken');
const user_model_1 = require("../models/user.model");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let headerToken = req.header('Authorization');
        if (!headerToken || !headerToken.startsWith('Bearer ')) {
            return res.status(422).send({
                error: "the request is missing bearer token"
            });
        }
        headerToken = headerToken.substring(7);
        //custom function (promise) 
        const decoded = yield (0, exports.jwtVerify)(headerToken);
        req.user = yield user_model_1.User.findById(decoded._id);
        req.token = headerToken;
        next();
    }
    catch (e) {
        console.log(e);
    }
});
exports.auth = auth;
const jwtVerify = (headerToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(headerToken, process.env.JWT, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
};
exports.jwtVerify = jwtVerify;
