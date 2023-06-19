"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController = require('../controllers/user.controller');
const router = (0, express_1.Router)();
router.post('/send-request-to-connect', auth_1.auth, userController.requestToConnectWithOtherUser);
router.post('/accept-request-to-connect', auth_1.auth, userController.acceptRequestToConnect);
exports.default = router;
