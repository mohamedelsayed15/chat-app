import { Response,NextFunction } from "express";
import { User } from '../models/user.model'
import RoomOneToOne from '../models/oneToOneChat.model'
exports.requestToConnectWithOtherUser = async (req: any, res:Response, next:NextFunction) => {
    try {
        const userId = req.body.userId
        // making sure that the request isn't already there 
        const doesExistInConnectRequests = req.user
                                .connectRequests
                                .findIndex((request:any)=> request.user_Id === userId )

        if (doesExistInConnectRequests !== -1) {
            return res.status(409).json({
                error : "conflict a request has already been sent"
            })
        }
        const doesExistInContacts = req.user
                                .contacts
                                .findIndex((contact:any)=> contact.contactId?.toString() === userId )

        if (doesExistInContacts !== -1) {
            return res.status(409).json({
                error : "conflict user is already a contact"
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
        const requestIndex = req.user.connectRequests.findIndex((request:any) => request.user_id === user_Id)

        if (requestIndex === -1) {
            return res.status(404).json({
                error:"couldn't find the specified request"
            })
        }

        const request = req.user.connectRequests[requestIndex]
        // second user
        const user = await User.findById({ _id:request.user_Id })

        if (!user) {
            return res.status(404).json({
                error:"couldn't find user"
            })
        }
        //splice the connectRequests array
        req.user.connectRequests.splice(requestIndex, 1);
        // add both of the users to contacts of each other
        req.user.contacts.push({
            contactName: user.name,
            contactId: user._id
        })

        user.contacts.push({
            contactName: req.user.name,
            contactId: req.user._id
        })
        // creating their room
        let room:any = new RoomOneToOne({
            userOne: user._id,
            userTwo: req.user._id,
        })
        // save the room user 1 and user 2
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
