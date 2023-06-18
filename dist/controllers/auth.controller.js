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
const user_model_1 = require("../models/user.model");
exports.signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield new user_model_1.User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        yield user.save();
        return res.status(201).send(user);
    }
    catch (e) {
        console.log(e);
    }
});
exports.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByCredentials(req.body.email, req.body.password);
        if (!user) {
            return res.status(401).send({ error: "couldn't find user" });
        }
        const token = yield user.genAuthToken();
        res.status(200).send({ user, token });
    }
    catch (e) {
    }
});
