import express from "express"
import path from 'path'
import http from 'http'

const User = require('./utils/users.js')
const { generateMessage } = require('./utils/messages')
const Filter = require('bad-words')
const socketio = require("socket.io")

const app = express()

const server = http.createServer(app)

const io = socketio(server)

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res, next) => {
    res.render('../public/index.html')
})

io.on('connection', (socket: any) => {

    // sends a message for the client connection
    //socket.emit('message',generateMessage('Welcome!'))
    // sends a message for all clients except the one triggered it 
    //socket.broadcast.emit('message', generateMessage('a new user has joined'))
    interface obj {
        username: string
        room: string
    }
    let currentRoom: string

    socket.on('join', ({ username, room }: obj, callback: Function) => {
        //could only be used on the server

        const { error, user } = User.addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        //sending welcome message to user only has nothing to do with rooms 
        socket.emit('message', generateMessage(`Welcome ${user.username}`, user.username))

        // broadcasting a user has joined doesn't appear to user triggered it
        socket.broadcast.to(user.room).emit(
            'message',
            generateMessage(`${user.username} has joined`, user.username)
        )
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: User.getUsersInRoom(user.room)
        })

        /*emit for users in room except the user triggered action 
        socket.broadcast.to(room).emit

        emit for users in a certain room 
        socket.to(room).emit*/
    })
    socket.on('sendMessage', (message: string, callback: Function) => {

        const user = User.findUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        } else {
            //sends the message for all clients
            io.to(user.room).emit('message', generateMessage(message,user.username))
            callback()
        }
    })


    socket.on(
        'sendLocation',
        (position: { latitude: number, longitude: number }, callback: Function) => {

        const user = User.findUser(socket.id)

            io.to(user.room).emit(
                'location',
                generateMessage(
                    `https://google.com/maps/?q=${position.latitude},${position.longitude}`,
                    user.username
                ))
            callback()
        })

    socket.on('disconnect', () => {
        const user = User.removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: User.getUsersInRoom(user.room)
            })
            io.to(user.room).emit('message', generateMessage( `${user.username} has left`))            
        }
    })
    socket.on("connect_error", (err:any) => {
        console.log(`connect_error due to ${err.message}`)
    })
})

server.listen(process.env.PORT, () => {
    console.log(process.env.PORT)
}) 