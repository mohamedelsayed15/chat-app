import { Router } from "express";

const authController = require('../controllers/auth.controller')


const router = Router()

router.post(
    '/login',
    authController.login
    )

router.put(
    '/signup',
    authController.signup
    )



export default router