import express from "express"
import path from 'path'
import http from 'http'

const socketio = require("socket.io")

const app = express()

const server = http.createServer(app)

const io = socketio(server);

app.use(express.static(path.join(__dirname, '../public')))


io.on('connection', (socket: any) => {
    // sends a message for the client connection
    socket.emit('message', 'Welcome!')
    // sends a message for all clients except the one triggered it 
    socket.broadcast.emit('message', 'a new user has joined')

    socket.on('sendMessage', (message: string) => {
        //sends the message for all clients
        io.emit('message', message)

    })

    socket.on('disconnect', () => {
        io.emit('message', ' a user has left')
    })
})

app.get('/', (req, res, next) => {
    res.render('../public/index.html')
})

server.listen(process.env.PORT, () => {
    console.log(process.env.PORT)
})