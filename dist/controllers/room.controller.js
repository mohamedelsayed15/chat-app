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
const oneToOneChat_model_1 = __importDefault(require("../models/oneToOneChat.model"));
exports.getRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.roomId;
        const room = yield oneToOneChat_model_1.default.findById(roomId);
        if (!room) {
            return res.status(404).json({
                error: "couldn't find the specified room"
            });
        }
        if (room.userOne.toString() !== req.user._id.toString()
            && room.userTwo.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: "unauthorized to view room"
            });
        }
        res.json(room);
    }
    catch (e) {
        console.log(e);
    }
});
exports.getUserRooms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield oneToOneChat_model_1.default.find({
            $or: [
                { userOne: req.user._id },
                { userTwo: req.user._id }
            ]
        }).sort({ updatedAt: 'desc' });
        res.json({
            rooms
        });
    }
    catch (e) {
        console.log(e);
    }
});
