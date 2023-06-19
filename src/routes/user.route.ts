import { Router } from "express";
import { auth } from '../middleware/auth'
const userController = require('../controllers/user.controller')


const router = Router()

router.post(
    '/send-request-to-connect',
    auth,
    userController.requestToConnectWithOtherUser
    )
router.post(
    '/accept-request-to-connect',
    auth,
    userController.acceptRequestToConnect
    )


export default router