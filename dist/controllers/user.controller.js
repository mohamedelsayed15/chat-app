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
const user_model_1 = require("../models/user.model");
const oneToOneChat_model_1 = __importDefault(require("../models/oneToOneChat.model"));
exports.requestToConnectWithOtherUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        // making sure that the request isn't already there 
        const doesExist = req.user
            .connectRequests
            .findIndex((request) => request.user_Id === userId);
        if (doesExist !== -1) {
            return res.status(409).json({
                error: "conflict a request has already been sent"
            });
        }
        const user = yield user_model_1.User.findById({ _id: userId });
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
exports.acceptRequestToConnect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //the id of the specified user
        const user_Id = req.body.user_Id;
        //finding user in the requests list
        let connectRequests = req.user.connectRequests;
        const requestIndex = connectRequests.findIndex((request) => request.user_id === user_Id);
        if (requestIndex === -1) {
            return res.status(404).json({
                error: "couldn't find the specified request"
            });
        }
        const request = connectRequests[requestIndex];
        const user = yield user_model_1.User.findById({ _id: request.user_Id });
        if (!user) {
            return res.status(404).json({
                error: "couldn't find user"
            });
        }
        req.user.connectRequests = connectRequests.splice(requestIndex, 1);
        req.user.contacts.push({
            contactName: user.name,
            contactId: user._id
        });
        user.contacts.push({
            contactName: req.user.name,
            contactId: req.user._id
        });
        let room = new oneToOneChat_model_1.default({
            userOne: user._id,
            userTwo: req.user._id,
        });
        room.messages.push({
            message: "You can Start Chatting"
        });
        const [saveRoom, saveUser1, saveUser2] = yield Promise.all([
            room.save(),
            req.user.save(),
            user.save()
        ]);
        res.status(201).json({
            room
        });
    }
    catch (e) {
        console.log(e);
    }
});
