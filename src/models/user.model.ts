const bcrypt = require('bcryptjs')
import mongoose, { Schema, Document, Model }  from'mongoose'
const validator = require('validator')
const jwt = require('jsonwebtoken')
type token = { token: string }
// User class
interface IUser {
    name: string
    email:string
    password:string
    tokens: token[]
    contacts: any
    connectRequests:any
    verificationToken:string
    verifiedEmail: boolean
}

interface IUserDocument extends IUser, Document {
    generateEmailToken: () => Promise<any>;
    generatePasswordToken: () => Promise<any>;
    genAuthToken: () => Promise<any>
    toJSON:() => Promise<any>;
}

interface IUserModel extends Model<IUserDocument> {
    findByCredentials(email:string ,password:string): Function;
}

//==================================================
const schema = new mongoose.Schema<IUserDocument> ({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        index: { unique: true },
        lowercase: true, 

        validate(value: string) {
            if (!validator.isEmail(value)) { throw new Error('invalid email format') }
        }
    },
    password: {// note we cant use trim :true as it might be a part of the password
        type: String,
        required: true,
        minlength: 7,
        validate(value: string) {
            if (value.toLowerCase().includes('password')) { throw new Error('password')}
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    contacts: [{
        contactName: {
            type:String
        },
        contactId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }],
    connectRequests: [{
        userName: {
            type: String
        },
        user_Id: {
            type:String
        }
    }]

}, {
    timestamps: true
})
//virtual tasks field for .populate()
schema.virtual('chat', {
    ref: 'Chat',
    localField: '_id',
    foreignField:'owner'
})

//login by credentials
schema.statics.findByCredentials = async (email:string, password:string) => {

        const user = await User.findOne({ email })

        if (!user) { return null }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) { return null }

        return user

}
//filtering user data 
//toJSON retrieves the object the shape u want
schema.methods.toJSON = function () {
    
        const  userObject = this.toObject()
        delete userObject.password
        delete userObject.tokens
        delete userObject.verificationToken
        delete userObject.verifiedEmail
    
        return userObject
}
//hashing password before use save()
schema.pre('save', async function (this:any,next:Function) { // provided by mongoose

    // isModified is provided by mongoose
    if (this.isModified('password')) { 

        this.password = await bcrypt.hash(this.password,8)
    }
    next()
})

//authentication token generation
schema.methods.genAuthToken = async function () { 

    const token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT)

    this.tokens = this.tokens.concat({ token })

    await this.save()

    return token
}
//token for E-mail verification
schema.methods.generateEmailToken = async function () { 

    const token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT_VERIFY_ME,{ expiresIn: '1h' })

    this.verificationToken = token

    await this.save()

    return token
}

schema.methods.generatePasswordToken = async function () { 

    const token = await jwt.sign({ _id: this._id.toString() }, process.env.JWT_VERIFY_ME_FOR_PASSWORD,{ expiresIn: '1h' })

    this.verificationToken = token

    await this.save()

    return token
}
//===============================================================
export const User = mongoose.model<IUserDocument, IUserModel>('User', schema)
