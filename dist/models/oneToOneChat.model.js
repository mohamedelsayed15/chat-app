"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//==================================================
const schema = new mongoose_1.default.Schema({
    userOne: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userTwo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    messages: [{
            message: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }]
}, {
    timestamps: true
});
//===============================================================
const RoomOneToOne = mongoose_1.default.model('RoomOneToOne', schema);
exports.default = RoomOneToOne;
