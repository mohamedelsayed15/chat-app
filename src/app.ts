import express from "express"
import path from 'path'
import http from 'http'


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
    socket.emit('message',generateMessage('Welcome!'))
    // sends a message for all clients except the one triggered it 
    socket.broadcast.emit('message', generateMessage('a new user has joined'))
    interface obj {
        username: string
        room: string
    }
    socket.on('join', ({ username, room }: obj) => {
        //could only be used on the server
        socket.join(room)
        
    })
    socket.on('sendMessage', (message: string, callback: Function) => {
        
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        } else {
            //sends the message for all clients
            io.emit('message', generateMessage(message))
            callback()
        }
    })


    socket.on(
        'sendLocation',
        (position: { latitude: number, longitude: number }, callback: Function) => {

            io.emit(
                'location',
                generateMessage(
                    `https://google.com/maps/?q=${position.latitude},${position.longitude}`
                ))
            callback()

        })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('a user has left'))
    })
    socket.on("connect_error", (err:any) => {
        console.log(`connect_error due to ${err.message}`);
    })
})

server.listen(process.env.PORT, () => {
    console.log(process.env.PORT)
}) 