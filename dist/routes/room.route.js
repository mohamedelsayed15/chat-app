"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roomController = require('../controllers/room.controller');
const router = (0, express_1.Router)();
router.get('/get-room-chat/:roomId', auth_1.auth, roomController.getRoom);
router.get('/get-user-rooms', auth_1.auth, roomController.getUserRooms);
exports.default = router;
