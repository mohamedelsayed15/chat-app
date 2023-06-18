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
exports.requestToConnectWithOtherUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        console.log(userId);
        const user = yield user_model_1.User.findById({ _id: userId });
        console.log(user);
        if (!user) {
            return res.status(404).json({
                error: "couldn't find user"
            });
        }
        user.connectRequests.push({
            userName: req.user.name,
            user_Id: req.user._id
        });
        yield user.save();
        res.send({
            message: "sent"
        });
    }
    catch (e) {
    }
});
