"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = require('../controllers/auth.controller');
const router = (0, express_1.Router)();
router.post('/login', authController.login);
router.put('/signup', authController.signup);
exports.default = router;
