import mongoose from'mongoose'

//==================================================
const schema = new mongoose.Schema({
    userOne: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userTwo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    messages: [{
        message: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }]
}, {
    timestamps: true
})


//===============================================================
const RoomOneToOne = mongoose.model('RoomOneToOne', schema)

export default RoomOneToOne