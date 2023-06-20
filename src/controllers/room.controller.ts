import { Response,NextFunction } from "express";
import RoomOneToOne from '../models/oneToOneChat.model'

exports.getRoom = async (req: any, res:Response, next:NextFunction) => {
    try {
        const roomId = req.params.roomId
        const room = await RoomOneToOne.findById(roomId)
        if (!room) {
            return res.status(404).json({
                error:"couldn't find the specified room"
            })
        }
        if (room.userOne.toString() !== req.user._id.toString()
            && room.userTwo.toString() !== req.user._id.toString()) {
            
            return res.status(401).json({
                error: "unauthorized to view room"
            })
        }
        res.json(room)
    } catch (e) {
        console.log(e)
    }
}

exports.getUserRooms = async (req: any, res:Response, next:NextFunction) => {
    try {
        const rooms = await RoomOneToOne.find({
            $or: [
                { userOne: req.user._id },
                { userTwo: req.user._id }
            ]
        }).sort({ updatedAt: 'desc' });

        res.json({
            rooms
        })
    } catch (e) {
        console.log(e)
    }
}