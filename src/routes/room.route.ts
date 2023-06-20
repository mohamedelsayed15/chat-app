import { Router } from "express";
import { auth } from '../middleware/auth'
const roomController = require('../controllers/room.controller')


const router = Router()

router.get(
    '/get-room-chat/:roomId',
    auth,
    roomController.getRoom
)
router.get(
    '/get-user-rooms',
    auth,
    roomController.getUserRooms
)

export default router