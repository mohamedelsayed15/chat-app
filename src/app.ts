import express from "express"
import path from 'path'
import http from 'http'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import { jwtVerify } from "./middleware/auth"
import { User } from "./models/user.model"
import RoomOneToOne from "./models/oneToOneChat.model"

require('dotenv').config()
require('./utils/mongoose')

const { generateMessage } = require('./utils/messages')
const Filter = require('bad-words')
const socketio = require("socket.io")
const app = express()

app.use(cors())
app.use(express.json())
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))

app.use('/auth', authRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res, next) => {
    res.render('../public/index.html')
})


// sends a message for the client connection
        //socket.emit('message',generateMessage('Welcome!'))
        // sends a message for all clients except the one triggered it 
        //socket.broadcast.emit('message', generateMessage('a new user has joined'))
        

io.on('connection', (socket: any) => {
    console.log("a connection")
    interface data {
        token: string
    }
socket.on('join', async (
    data: data,
    callback: Function
) => {
    try {
        // validation
        if (!data.token) {
            return socket.disconnect();
        }
        const { token } = data

        const decoded: any = await jwtVerify(token)
        const user = await User.findById(decoded._id)

        if (!user || user.contacts.length === 0) {
            return 
        }

        for (let i = 0; i < user.contacts.length; i++) {
            socket.join(user.contacts[i].roomId.toString())
        }

        return callback && callback()
    } catch (e) {
        console.log(e)
        socket.disconnect()
    }
})
    interface message{
        token: string
        roomId: string
        text : string
    }
socket.on(
    'sendMessage',
    async (message: message, callback: Function) => {
        try {
            // validation
            if (!message.token || !message.roomId || !message.text) {
                console.log(1)
                return socket.disconnect();
            }
            const { token, roomId, text } = message

            const decoded: any = await jwtVerify(token)

            const [user,room]:any = await Promise.all([
                User.findById(decoded._id),
                RoomOneToOne.findById(roomId)
            ]) 
            if (!user || !room) {

                return socket.disconnect()
            }

            if (room.userOne.toString() !== decoded._id
                && room.userTwo.toString() !== decoded._id) {
                return socket.disconnect()
            }

            const filter = new Filter()

            if (filter.isProfane(message.text)) {
                return callback('Profanity is not allowed')
            } else {
                // function from utils directory
                const generatedMessage: any = generateMessage(text, user.name)
                room.messages.push(generatedMessage)
                await room.save()
                //sends the message for all clients
                io.to(room._id.toString()).emit('message',generatedMessage)
                return callback && callback()
            }
    } catch (e) {
        console.log(e)
        socket.disconnect()
    }
})

        socket.on('disconnect', () => {
            console.log("a disconnection")
        })
        socket.on("error", (err:Error) => {
            if (err && err.message === "unauthorized event") {
                socket.disconnect();
            }
            console.log(err)
        });
        socket.on("connect_error", (err: any) => {
            console.log(`connect_error due to ${err.message}`)
        })
        socket.on("error", (err:Error) => {
            if (err && err.message === "unauthorized event") {
                socket.disconnect();
            }
        });
    })

server.listen(process.env.PORT, () => {
    console.log(process.env.PORT)
}) 