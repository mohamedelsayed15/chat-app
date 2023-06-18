import { Response,NextFunction } from "express";
import { User } from '../models/user.model'
import { Types } from 'mongoose'



exports.requestToConnectWithOtherUser = async (req: any, res:Response, next:NextFunction) => {
    try {
        const userId = req.body.userId
        console.log(userId)
        const user = await User.findById({ _id:userId })
        console.log(user)
        if (!user) {
            return res.status(404).json({
                error:"couldn't find user"
            })
        }

        user.connectRequests.push({
            userName: req.user.name,
            user_Id: req.user._id
        })

        await user.save()

        res.send({
            message:"sent"
        })
    } catch (e) {
        
    }
}
