import { Request,Response,NextFunction } from "express";
import { User } from '../models/user.model'

exports.signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })

        await user.save()

        return res.status(201).send(user)
    } catch (e) {
        console.log(e)
    }
}

exports.login = async (req: Request, res:Response, next:NextFunction) => {
    try {
        const user:any = await User.findByCredentials(req.body.email, req.body.password)

        if (!user) {
            return res.status(401).send({ error: "couldn't find user" })
        }

        const token = await user.genAuthToken()

        res.status(200).send({ user, token })
    } catch (e) {
        
    }
}