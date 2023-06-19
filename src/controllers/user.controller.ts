import { Response,NextFunction } from "express";
import { User } from '../models/user.model'
import RoomOneToOne from '../models/oneToOneChat.model'
exports.requestToConnectWithOtherUser = async (req: any, res:Response, next:NextFunction) => {
    try {
        const userId = req.body.userId
        // making sure that the request isn't already there 
        const doesExist = req.user
                                .connectRequests
                                .findIndex((request:any)=> request.user_Id === userId )

        if (doesExist !== -1) {
            return res.status(409).json({
                error : "conflict a request has already been sent"
            })
        }

        const user = await User.findById({ _id: userId })

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

exports.acceptRequestToConnect = async (req: any, res:Response, next:NextFunction) => {
    try {
        //the id of the specified user
        const user_Id = req.body.user_Id

        //finding user in the requests list
        let connectRequests = req.user.connectRequests

        const requestIndex = connectRequests.findIndex((request:any) => request.user_id === user_Id)

        if (requestIndex === -1) {
            return res.status(404).json({
                error:"couldn't find the specified request"
            })
        }

        const request = connectRequests[requestIndex]

        const user = await User.findById({ _id:request.user_Id })

        if (!user) {
            return res.status(404).json({
                error:"couldn't find user"
            })
        }

        req.user.connectRequests = connectRequests.splice(requestIndex, 1);

        req.user.contacts.push({
            contactName: user.name,
            contactId: user._id
        })

        user.contacts.push({
            contactName: req.user.name,
            contactId: req.user._id
        })
        let room:any = new RoomOneToOne({
            userOne: user._id,
            userTwo: req.user._id,
        })
        room.messages.push({
            message: "You can Start Chatting"
        })
        const [saveRoom, saveUser1, saveUser2] = await Promise.all([
            room.save(),
            req.user.save(),
            user.save()
        ])
        res.status(201).json({
            room
        })
    } catch (e) {
        console.log(e)
    }
}
